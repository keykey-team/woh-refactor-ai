// Repos/Offer.repo.js
function buildOfferMatch({ groupIds, onlyAvailable, priceMin, priceMax }) {
  const match = { groupId: { $in: groupIds } };
  if (onlyAvailable) match.available = true;

  if (priceMin != null || priceMax != null) {
    match.price = {};
    if (priceMin != null) match.price.$gte = Number(priceMin);
    if (priceMax != null) match.price.$lte = Number(priceMax);
  }
  return match;
}

function buildOptExpr(optIndexFilter) {
  const expr = [];
  if (!optIndexFilter || typeof optIndexFilter !== "object") return expr;

  for (const [k, v] of Object.entries(optIndexFilter)) {
    const idx = Number(k);
    if (!Number.isFinite(idx)) continue;

    const valExpr = { $arrayElemAt: ["$optionValues", idx] };

    if (Array.isArray(v)) {
      const arr = v.filter((x) => x !== undefined && x !== null);
      if (!arr.length) continue;
      expr.push({ $in: [valExpr, arr] });
    } else {
      if (v === undefined || v === null) continue;
      expr.push({ $eq: [valExpr, v] });
    }
  }

  return expr;
}

function omitOptIndex(optIndexFilter, axisIndex) {
  if (!optIndexFilter || typeof optIndexFilter !== "object") return null;
  const out = {};
  for (const [k, v] of Object.entries(optIndexFilter)) {
    if (Number(k) === axisIndex) continue;
    out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}


export function createOfferRepo({ Offer }) {
  return {
    async listByGroup(groupId) {
      return Offer.find({ groupId }).sort({ available: -1, price: 1, _id: 1 }).lean();
    },

    async findByGroupAndOptionKey(groupId, optionKey) {
      return Offer.findOne({ groupId, optionKey }).lean();
    },

    async findByGroupAndOptionValues(groupId, optionValues) {
      const key = Array.isArray(optionValues) ? optionValues.map(String).join("|") : "";
      if (!key) return null;
      return Offer.findOne({ groupId, optionKey: key }).lean();
    },

    // ✅ ВАЖНО: получить universe groupIds по offer-фильтрам (offerChar + opt + price + available)
    async getMatchedGroupIdsByOfferFilters({
      baseGroupIds,          // groupIds из groupFilter (категория/поиск)
      onlyAvailable = false,
      priceMin = null,
      priceMax = null,
      optIndexFilter = null,
      offerCharMatch = null, // из buildOfferCharMatch()
    }) {
      const offerMatch = buildOfferMatch({
        groupIds: baseGroupIds,
        onlyAvailable,
        priceMin,
        priceMax,
      });

      const optExpr = buildOptExpr(optIndexFilter);

      const matchStage =
        optExpr.length > 0
          ? { $match: { ...offerMatch, ...(offerCharMatch || {}), $expr: { $and: optExpr } } }
          : { $match: { ...offerMatch, ...(offerCharMatch || {}) } };

      const rows = await Offer.aggregate([
        matchStage,
        { $group: { _id: "$groupId" } },
      ]);

      return rows.map((r) => r._id);
    },

    async aggregateCatalogInfo({
  groupIds,
  enabledPreview,
  depth,
  maxValuesPerAxis,
  includeOffers,
  maxOffersPerGroup,
  onlyAvailable = false,
  priceMin = null,
  priceMax = null,
  optIndexFilter = null,
  offerCharMatch = null,
}) {
  const wantBestOffer = includeOffers === "preview";
  const wantAllOffers = includeOffers === "all";
  const wantAnyOffers = wantBestOffer || wantAllOffers;
  const safeMaxOffersPerGroup = Math.max(
    1,
    Math.min(500, maxOffersPerGroup ?? 80)
  );

  const offerMatch = buildOfferMatch({
    groupIds,
    onlyAvailable,
    priceMin,
    priceMax,
  });

  const optExpr = buildOptExpr(optIndexFilter);

  const rootStage =
    optExpr.length > 0
      ? {
          $match: {
            ...offerMatch,
            ...(offerCharMatch || {}),
            $expr: { $and: optExpr },
          },
        }
      : {
          $match: {
            ...offerMatch,
            ...(offerCharMatch || {}),
          },
        };

  return Offer.aggregate([
    rootStage,

    // считаем totalStockPerOffer для каждого оффера
    {
      $addFields: {
        totalStockPerOffer: {
          $sum: {
            $map: {
              input: { $ifNull: ["$stocks", []] },
              as: "stock",
              in: {
                $max: [
                  {
                    $subtract: [
                      { $ifNull: ["$$stock.onHand", 0] },
                      { $ifNull: ["$$stock.reserved", 0] },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    {
      $group: {
        _id: "$groupId",
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        variantsCount: { $sum: 1 },
        hasAvailable: { $max: { $cond: ["$available", 1, 0] } },
        totalStock: { $sum: "$totalStockPerOffer" },
      },
    },

    ...(enabledPreview && depth > 0
      ? [
          {
            $lookup: {
              from: Offer.collection.name,
              let: { gid: "$_id" },
              pipeline: [
                {
                  $match: {
                    ...offerMatch,
                    ...(offerCharMatch || {}),
                    $expr: {
                      $and: [{ $eq: ["$groupId", "$$gid"] }, ...optExpr],
                    },
                  },
                },
                { $unwind: { path: "$optionValues", includeArrayIndex: "axisIndex" } },
                { $match: { axisIndex: { $lt: depth } } },
                { $group: { _id: { axisIndex: "$axisIndex", value: "$optionValues" } } },
                { $group: { _id: "$_id.axisIndex", values: { $push: "$_id.value" } } },
                {
                  $project: {
                    _id: 0,
                    axisIndex: "$_id",
                    values: { $slice: ["$values", maxValuesPerAxis] },
                  },
                },
              ],
              as: "variantPreviewAxes",
            },
          },
        ]
      : [{ $addFields: { variantPreviewAxes: [] } }]),

    ...(wantAnyOffers
      ? [
          {
            $lookup: {
              from: Offer.collection.name,
              let: { gid: "$_id" },
              pipeline: [
                {
                  $match: {
                    ...offerMatch,
                    ...(offerCharMatch || {}),
                    $expr: {
                      $and: [{ $eq: ["$groupId", "$$gid"] }, ...optExpr],
                    },
                  },
                },
                {
                  $addFields: {
                    totalStock: {
                      $sum: {
                        $map: {
                          input: { $ifNull: ["$stocks", []] },
                          as: "stock",
                          in: {
                            $max: [
                              {
                                $subtract: [
                                  { $ifNull: ["$$stock.onHand", 0] },
                                  { $ifNull: ["$$stock.reserved", 0] },
                                ],
                              },
                              0,
                            ],
                          },
                        },
                      },
                    },
                  },
                },
                { $sort: { available: -1, price: 1, _id: 1 } },
                { $limit: wantBestOffer ? 1 : safeMaxOffersPerGroup },
                {
                  $project: {
                    _id: 1,
                    groupId: 1,
                    sku: 1,
                    price: 1,
                    effectivePrice: 1,
                    opt_price: 1,
                    discount: 1,
                    discountUAH: 1,
                    discountType: 1,
                    available: 1,
                    img: 1,
                    optionValues: 1,
                    optionKey: 1,
                    characteristics: 1,
                    totalStock: 1,
                  },
                },
              ],
              as: "offers",
            },
          },
        ]
      : [{ $addFields: { offers: [] } }]),

    {
      $project: {
        _id: 1,
        minPrice: 1,
        maxPrice: 1,
        variantsCount: 1,
        hasAvailable: 1,
        totalStock: 1,
        variantPreviewAxes: 1,
        offers: 1,
      },
    },
  ]);
},

    async aggregateOfferFacets({
      groupIds,
      onlyAvailable = false,
      priceMin = null,
      priceMax = null,
      optIndexFilter = null,
      axisIndices = [],
      offerCharMatch = null,
    }) {
      const offerMatch = buildOfferMatch({ groupIds, onlyAvailable, priceMin, priceMax });

      // ===== pricing: учитывает ВСЕ opt-фильтры =====
      const fullOptExpr = buildOptExpr(optIndexFilter);

      const pricingMatchStage =
        fullOptExpr.length > 0
          ? { $match: { ...offerMatch, ...(offerCharMatch || {}), $expr: { $and: fullOptExpr } } }
          : { $match: { ...offerMatch, ...(offerCharMatch || {}) } };

      // ===== axis facets (sticky): для каждой оси убираем её opt-фильтр =====
      const axisFacets = {};
      for (const axisIndex of axisIndices || []) {
        const stickyOpt = omitOptIndex(optIndexFilter, axisIndex);
        const stickyExpr = buildOptExpr(stickyOpt);

        const axisMatchStage =
          stickyExpr.length > 0
            ? { $match: { ...offerMatch, ...(offerCharMatch || {}), $expr: { $and: stickyExpr } } }
            : { $match: { ...offerMatch, ...(offerCharMatch || {}) } };

        axisFacets[`a${axisIndex}`] = [
          axisMatchStage,
          { $project: { v: { $arrayElemAt: ["$optionValues", axisIndex] } } },
          { $group: { _id: "$v", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              value: { $ifNull: ["$_id", null] },
              count: 1,
            },
          },
        ];
      }

      const rows = await Offer.aggregate([
        {
          $facet: {
            pricing: [
              pricingMatchStage,
              { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
            ],
            ...axisFacets,
          },
        },
      ]);

      const out = rows?.[0] || {};
      const pricing = out.pricing?.[0] || { min: null, max: null };

      const axisBuckets = (axisIndices || []).map((axisIndex) => ({
        _id: axisIndex,
        buckets: (out[`a${axisIndex}`] || []).map((r) => ({
          value: r.value ?? null,
          count: r.count ?? 0,
        })),
      }));

      return { pricing, axisBuckets };
    },

    // ✅ FACETS по Offer.characteristics (одним аггрегатом для всех keys)
    async aggregateOfferCharacteristicBuckets({ offerBaseMatch, allowedKeys }) {
      const keys = Array.isArray(allowedKeys) ? allowedKeys.filter(Boolean) : [];
      if (!keys.length) return [];

      const rows = await Offer.aggregate([
        { $match: offerBaseMatch },

        { $unwind: "$characteristics" },
        { $match: { "characteristics.key": { $in: keys } } },

        {
          $facet: {
            scalar: [
              { $match: { "characteristics.type": { $ne: "multiselect" } } },
              { $project: { key: "$characteristics.key", normValue: "$characteristics.value.value" } },
            ],
            multi: [
              { $match: { "characteristics.type": "multiselect" } },
              { $unwind: "$characteristics.values" },
              { $project: { key: "$characteristics.key", normValue: "$characteristics.values.value" } },
            ],
          },
        },

        { $project: { rows: { $concatArrays: ["$scalar", "$multi"] } } },
        { $unwind: "$rows" },
        { $replaceRoot: { newRoot: "$rows" } },

        { $match: { normValue: { $ne: null } } },

        { $group: { _id: { key: "$key", value: "$normValue" }, count: { $sum: 1 } } },
        { $group: { _id: "$_id.key", buckets: { $push: { value: "$_id.value", count: "$count" } } } },
        { $sort: { _id: 1 } },
      ]);

      return rows;
    },

    // ✅ sticky для одного offer-key (точно, но дороже)
    async aggregateOfferCharacteristicBucketsOneKey({ offerBaseMatch, key }) {
      const rows = await Offer.aggregate([
        { $match: offerBaseMatch },

        { $unwind: "$characteristics" },
        { $match: { "characteristics.key": key } },

        {
          $facet: {
            scalar: [
              { $match: { "characteristics.type": { $ne: "multiselect" } } },
              { $group: { _id: "$characteristics.value.value", count: { $sum: 1 } } },
            ],
            multi: [
              { $match: { "characteristics.type": "multiselect" } },
              { $unwind: "$characteristics.values" },
              { $group: { _id: "$characteristics.values.value", count: { $sum: 1 } } },
            ],
          },
        },

        { $project: { buckets: { $concatArrays: ["$scalar", "$multi"] } } },
      ]);

      const buckets = rows?.[0]?.buckets ?? [];
      return buckets.map((x) => ({ value: x._id ?? null, count: x.count ?? 0 }));
    },
    async listOfferCharacteristicKeys({ offerBaseMatch }) {
      const rows = await Offer.aggregate([
        { $match: offerBaseMatch },
        { $unwind: "$characteristics" },
        { $group: { _id: "$characteristics.key" } },
        { $sort: { _id: 1 } },
      ]);
      return rows.map((r) => r._id).filter(Boolean);
    },

    /**
     * Пагинация групп, отсортированных по минимальной цене оффера.
     * Используется вместо findPage когда sort=price_asc/price_desc.
     */
    async paginateByMinPrice({
      groupIds,
      sortDir = 1,
      skip = 0,
      limit = 24,
      onlyAvailable = false,
      priceMin = null,
      priceMax = null,
      offerCharMatch = null,
      optIndexFilter = null,
    }) {
      if (!groupIds || !groupIds.length) return { sortedGroupIds: [], total: 0 };

      const offerMatch = buildOfferMatch({ groupIds, onlyAvailable, priceMin, priceMax });
      const optExpr = buildOptExpr(optIndexFilter);

      const matchStage =
        optExpr.length > 0
          ? { $match: { ...offerMatch, ...(offerCharMatch || {}), $expr: { $and: optExpr } } }
          : { $match: { ...offerMatch, ...(offerCharMatch || {}) } };

      const [rows, countRows] = await Promise.all([
        Offer.aggregate([
          matchStage,
          { $group: { _id: "$groupId", minPrice: { $min: "$price" } } },
          { $sort: { minPrice: sortDir, _id: 1 } },
          { $skip: skip },
          { $limit: limit },
        ]),
        Offer.aggregate([
          matchStage,
          { $group: { _id: "$groupId" } },
          { $count: "total" },
        ]),
      ]);

      return {
        sortedGroupIds: rows.map((r) => r._id),
        total: countRows[0]?.total ?? 0,
      };
    },
  };
}
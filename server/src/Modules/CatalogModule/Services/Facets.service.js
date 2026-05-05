import { parseBool, parseNum, safeJsonParse } from "../utils/query.js";
import { resolveFilterCategoryIds } from "../utils/resolveFilterCategoryIds.js";
import {
  buildGroupFilter,
  omitCharKeyFromGroupFilter,
  buildOfferCharMatch,
  omitOfferCharKeyFromOfferMatch,
} from "./CatalogFilterBuilder.js";

function metaFromCharacteristicMeta(m) {
  return {
    key: m.key,
    title: m.title ?? { ua: "", en: "" },
    type: m.type ?? "string",
    unit: m.unit ?? null,
    valuesPreset: Array.isArray(m.valuesPreset) ? m.valuesPreset : [],
    scope: m.scope ?? "group",
  };
}

function fallbackMetaForKey(key) {
  const nice = {
    brand: { ua: "Бренд", en: "Бренд" },
    audience: { ua: "Для кого", en: "Для кого" },
    material: { ua: "Матеріал", en: "Материал" },
    isNew: { ua: "Новинка", en: "Новинка" },
    discount: { ua: "Знижка", en: "Скидка" },
    color: { ua: "Колір", en: "Цвет" },
    tags: { ua: "Теги", en: "Теги" },
  };

  return {
    key,
    title: nice[key] ?? { ua: key, en: key },
    type: "select",
    unit: null,
    valuesPreset: [],
    scope: "unknown",
  };
}

/**
 * Simple perf logger (no deps)
 * - enabled by default in non-production
 * - can be forced via FACETS_DEBUG=1
 * - supports nested sections with totals
 */
function createPerfLogger({ scope = "facets", enabled = false } = {}) {
  const now =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? () => performance.now()
      : () => Date.now();

  const isEnabled =
    enabled === false
      ? false
      : enabled ||
        process.env.FACETS_DEBUG === "1" ||
        process.env.FACETS_DEBUG === "true";

  const t0 = now();
  const marks = [];

  const ms = (x) => Math.round(x * 100) / 100;

  const log = (...args) => {
    if (!isEnabled) return;
    console.log(`[${scope}]`, ...args);
  };

  const section = (label) => {
    if (!isEnabled) return () => {};
    const s = now();
    return (extra) => {
      const d = now() - s;
      marks.push({ label, ms: d, extra });
      if (extra !== undefined) log(`${label}: ${ms(d)}ms`, extra);
      else log(`${label}: ${ms(d)}ms`);
    };
  };

  const info = (label, data) => {
    if (!isEnabled) return;
    log(label, data ?? "");
  };

  const flush = () => {
    if (!isEnabled) return;
    const total = now() - t0;
    log(`TOTAL: ${ms(total)}ms`);
    if (marks.length) {
      const top = [...marks].sort((a, b) => b.ms - a.ms).slice(0, 10);
      log(
        `TOP sections:`,
        top.map((x) => `${x.label}=${ms(x.ms)}ms`).join(" | ")
      );
    }
  };

  return { section, info, flush, enabled: isEnabled };
}

export function createFacetsService({
  productGroupRepo,
  offerRepo,
  categoryRepo,
  characteristicMetaRepo,
  productGroupFacetsRepo,
}) {
  return {
    async getFacets(params = {}) {
      const perf = createPerfLogger({
        scope: "catalog.facets",
        enabled: false,
      });

      perf.info("params", {
        status: params.status,
        categoryId: params.categoryId,
        categoryInclude: params.categoryInclude,
        q: params.q ? String(params.q).slice(0, 80) : "",
        onlyAvailable: params.onlyAvailable,
        priceMin: params.priceMin,
        priceMax: params.priceMax,
        hasChar: !!params.char,
        hasOfferChar: !!params.offerChar,
        hasOpt: !!params.opt,
        sticky: params.sticky,
      });

      const endAll = perf.section("getFacets()");

      const status = params.status || "active";
      const categoryId = params.categoryId || null;
      const categoryInclude = params.categoryInclude || "branch";

      const endResolveCats = perf.section(
        "resolveFilterCategoryIds (branch ± categoryIds)",
      );
      const categoryIds = await resolveFilterCategoryIds({
        categoryRepo,
        categoryId,
        categoryInclude,
        categoryIdsParam: params.categoryIds ?? null,
      });
      endResolveCats({
        count: categoryIds?.length ?? 0,
      });

      const endBuildFilter = perf.section("buildGroupFilter");
      const groupFilter = buildGroupFilter({
        status,
        categoryIds,
        q: params.q,
        charRaw: params.char,
      });
      endBuildFilter();

      // groups universe
      const endGroups = perf.section("productGroupRepo.findIdsWithAxes");
      const groups = await productGroupRepo.findIdsWithAxes(groupFilter);
      endGroups({ groups: groups?.length ?? 0 });

      const groupIds = groups.map((g) => g._id);

      perf.info("groupIds", {
        count: groupIds.length,
      });

      if (!groupIds.length) {
        endAll();
        perf.flush();
        return {
          pricing: { min: null, max: null, currency: "UAH" },
          variationAxes: {},
          groupCharacteristics: {},
          offerCharacteristics: {},
          categories: {
            meta: {
              key: "categories",
              title: { ua: "Категорії", en: "Categories" },
              type: "category",
              scope: "catalog",
            },
            buckets: [],
          },
        };
      }

      // offer filters
      const endParseOffers = perf.section("parse offer filters");
      const onlyAvailable = parseBool(params.onlyAvailable, false);
      const priceMin = parseNum(params.priceMin, null);
      const priceMax = parseNum(params.priceMax, null);
      endParseOffers({ onlyAvailable, priceMin, priceMax });

      // opt axisId -> axisIndex
      const endOpt = perf.section("parse opt + map axisId->axisIndex");
      const optObj = safeJsonParse(params.opt, null);
      let optIndexFilter = null;

      const firstAxes = Array.isArray(groups[0]?.variationAxes)
        ? groups[0].variationAxes
        : [];

      if (optObj && typeof optObj === "object") {
        const map = {};
        for (const [axisId, val] of Object.entries(optObj)) {
          const idx = firstAxes.findIndex((a) => a.axisId === axisId);
          if (idx >= 0) map[idx] = val;
        }
        optIndexFilter = Object.keys(map).length ? map : null;
      }
      endOpt({
        axesCount: firstAxes.length,
        optKeys: optObj && typeof optObj === "object" ? Object.keys(optObj).length : 0,
        optIndexFilterKeys: optIndexFilter ? Object.keys(optIndexFilter).length : 0,
      });

      const endOfferChar = perf.section("buildOfferCharMatch");
      const offerCharMatch = buildOfferCharMatch(params.offerChar);
      endOfferChar({ has: !!offerCharMatch && Object.keys(offerCharMatch).length > 0 });

      const axisIndices = firstAxes.map((_, idx) => idx);

      // facets by offers: pricing + axes buckets
      const endOfferFacets = perf.section("offerRepo.aggregateOfferFacets");
      const { pricing, axisBuckets } = await offerRepo.aggregateOfferFacets({
        groupIds,
        onlyAvailable,
        priceMin,
        priceMax,
        optIndexFilter,
        axisIndices,
        offerCharMatch,
      });
      endOfferFacets({
        axes: axisIndices.length,
        axisBuckets: axisBuckets?.length ?? 0,
        pricing,
      });

      // ===== VARIATION AXES (meta + buckets) =====
      const endVariationAxes = perf.section("build variationAxes response");
      const variationAxes = {};
      for (const row of axisBuckets) {
        const axisIndex = row._id;
        const axisMeta = firstAxes[axisIndex];
        const axisId = axisMeta?.axisId || `axis_${axisIndex}`;

        variationAxes[axisId] = {
          meta: {
            axisId,
            axisIndex,
            title: axisMeta?.title ?? { ua: axisId, en: axisId },
            type: axisMeta?.type ?? "string",
            unit: axisMeta?.unit ?? null,
            valuesPreset: axisMeta?.valuesPreset ?? [],
          },
          buckets: (row.buckets || [])
            .filter((b) => b.value !== null)
            .slice()
            .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
        };
      }
      endVariationAxes({ axes: Object.keys(variationAxes).length });

      const sticky = parseBool(params.sticky, false);
      perf.info("sticky", sticky);

      // ===== PARALLEL FETCH: characteristic metas + offer universe =====
      const endParallelFetch = perf.section("parallel: groupMetas + offerMetas + matchedGroupIds");
      const [groupMetas, offerMetas, matchedGroupIdsByOffer] = await Promise.all([
        characteristicMetaRepo.listFilterable({ status: "active", scope: "group" }),
        characteristicMetaRepo.listFilterable({ status: "active", scope: "offer" }),
        offerRepo.getMatchedGroupIdsByOfferFilters({
          baseGroupIds: groupIds,
          onlyAvailable,
          priceMin,
          priceMax,
          optIndexFilter,
          offerCharMatch,
        }),
      ]);
      endParallelFetch({
        groupMetas: groupMetas?.length ?? 0,
        offerMetas: offerMetas?.length ?? 0,
        matchedGroups: matchedGroupIdsByOffer?.length ?? 0,
      });

      // ===== GROUP CHARACTERISTICS (meta + buckets) =====
      let groupCharacteristics = {};

      let groupKeys = groupMetas.map((m) => m.key);

      if (!groupKeys.length) {
        const endListKeys = perf.section("productGroupFacetsRepo.listCharacteristicKeys (fallback)");
        groupKeys = await productGroupFacetsRepo.listCharacteristicKeys({ groupFilter });
        groupKeys = groupKeys.filter((k) => k !== "subtitle");
        endListKeys({ keys: groupKeys.length });
      }

      perf.info("groupKeys", { count: groupKeys.length });

      const groupMetaMap = new Map(
        groupMetas.map((m) => [m.key, metaFromCharacteristicMeta(m)])
      );

      if (!sticky) {
        const endAgg = perf.section("productGroupFacetsRepo.aggregateCharacteristicBuckets (all keys)");
        const rows = await productGroupFacetsRepo.aggregateCharacteristicBuckets({
          groupFilter,
          allowedKeys: groupKeys,
        });
        endAgg({ rows: rows?.length ?? 0 });

        for (const row of rows) {
          const key = row._id;
          groupCharacteristics[key] = {
            meta: groupMetaMap.get(key) ?? fallbackMetaForKey(key),
            buckets: (row.buckets || [])
              .slice()
              .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
          };
        }
      } else {
        const endStickyBatch = perf.section("GROUP sticky batch ($facet, 1 query)");

        // Базовый фильтр без char-условий — стартовая точка для $facet
        const { $and: _omit, ...baseGroupFilter } = groupFilter;

        // Для каждого ключа — фильтр без этого ключа (остальные char-условия остаются)
        const keyFilters = {};
        for (const key of groupKeys) {
          keyFilters[key] = omitCharKeyFromGroupFilter(groupFilter, key);
        }

        const stickyBuckets = await productGroupFacetsRepo.aggregateStickyBatch({
          baseGroupFilter,
          keyFilters,
        });

        endStickyBatch({ keys: groupKeys.length });

        for (const key of groupKeys) {
          const buckets = stickyBuckets[key] ?? [];
          groupCharacteristics[key] = {
            meta: groupMetaMap.get(key) ?? fallbackMetaForKey(key),
            buckets: buckets.slice().sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
          };
        }
      }

      // ===== OFFER CHARACTERISTICS (meta + buckets) =====
      let offerCharacteristics = {};

      let offerKeys = offerMetas.map((m) => m.key);

      const offerMetaMap = new Map(
        offerMetas.map((m) => [m.key, metaFromCharacteristicMeta(m)])
      );

      const relevantGroupIdsForCategories =
        matchedGroupIdsByOffer.length > 0
          ? matchedGroupIdsByOffer
          : groupIds;

      const endCategoryBuckets = perf.section(
        "productGroupRepo.aggregateCategoryIdCounts",
      );
      const categoryBucketRows =
        await productGroupRepo.aggregateCategoryIdCounts(
          relevantGroupIdsForCategories,
        );
      endCategoryBuckets({ buckets: categoryBucketRows?.length ?? 0 });

      const categoriesFacet = {
        meta: {
          key: "categories",
          title: { ua: "Категорії", en: "Categories" },
          type: "category",
          scope: "catalog",
        },
        buckets: (categoryBucketRows || []).map((b) => ({
          value: b.value,
          count: b.count,
        })),
      };

      const endOfferBase = perf.section("build offerBaseMatch");
      const offerBaseMatch = {
        groupId: { $in: matchedGroupIdsByOffer.length ? matchedGroupIdsByOffer : groupIds },
      };

      if (onlyAvailable) offerBaseMatch.available = true;

      if (priceMin != null || priceMax != null) {
        offerBaseMatch.price = {};
        if (priceMin != null) offerBaseMatch.price.$gte = Number(priceMin);
        if (priceMax != null) offerBaseMatch.price.$lte = Number(priceMax);
      }

      Object.assign(offerBaseMatch, offerCharMatch || {});
      endOfferBase();

      // fallback if meta empty — derive keys from Offer.characteristics
      if (!offerKeys.length) {
        const endListOfferKeys = perf.section("offerRepo.listOfferCharacteristicKeys (fallback)");
        offerKeys = await offerRepo.listOfferCharacteristicKeys({ offerBaseMatch });
        endListOfferKeys({ keys: offerKeys.length });
      }

      perf.info("offerKeys", { count: offerKeys.length });

      if (offerKeys.length) {
        if (!sticky) {
          const endAggOffer = perf.section("offerRepo.aggregateOfferCharacteristicBuckets (all keys)");
          const rows = await offerRepo.aggregateOfferCharacteristicBuckets({
            offerBaseMatch,
            allowedKeys: offerKeys,
          });
          endAggOffer({ rows: rows?.length ?? 0 });

          for (const row of rows) {
            const key = row._id;
            offerCharacteristics[key] = {
              meta: offerMetaMap.get(key) ?? fallbackMetaForKey(key),
              buckets: (row.buckets || [])
                .slice()
                .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
            };
          }
        } else {
          const endStickyLoop = perf.section("OFFER sticky loop (N queries)");
          let i = 0;

          for (const key of offerKeys) {
            i += 1;
            const endOne = perf.section(`offer sticky key=${key} (#${i}/${offerKeys.length})`);

            const stickyOfferCharMatch = omitOfferCharKeyFromOfferMatch(
              offerCharMatch || {},
              key
            );

            const matchedGroupIdsForKey =
              await offerRepo.getMatchedGroupIdsByOfferFilters({
                baseGroupIds: groupIds,
                onlyAvailable,
                priceMin,
                priceMax,
                optIndexFilter,
                offerCharMatch: stickyOfferCharMatch,
              });

            const stickyOfferBaseMatch = {
              groupId: {
                $in: matchedGroupIdsForKey.length ? matchedGroupIdsForKey : groupIds,
              },
            };

            if (onlyAvailable) stickyOfferBaseMatch.available = true;

            if (priceMin != null || priceMax != null) {
              stickyOfferBaseMatch.price = {};
              if (priceMin != null) stickyOfferBaseMatch.price.$gte = Number(priceMin);
              if (priceMax != null) stickyOfferBaseMatch.price.$lte = Number(priceMax);
            }

            Object.assign(stickyOfferBaseMatch, stickyOfferCharMatch || {});

            const buckets = await offerRepo.aggregateOfferCharacteristicBucketsOneKey({
              offerBaseMatch: stickyOfferBaseMatch,
              key,
            });

            offerCharacteristics[key] = {
              meta: offerMetaMap.get(key) ?? fallbackMetaForKey(key),
              buckets: (buckets || [])
                .slice()
                .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
            };

            endOne({
              buckets: buckets?.length ?? 0,
              matchedGroups: matchedGroupIdsForKey?.length ?? 0,
            });
          }

          endStickyLoop();
        }
      }

      endAll();
      perf.flush();

      return {
        pricing: { min: pricing?.min ?? null, max: pricing?.max ?? null, currency: "UAH" },
        variationAxes,
        groupCharacteristics,
        offerCharacteristics,
        categories: categoriesFacet,
      };
    },
  };
}
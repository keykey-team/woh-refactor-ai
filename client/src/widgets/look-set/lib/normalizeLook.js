export const LOOK_HERO_FALLBACK = "/img/fallback.jpg";

function categoryEntrySlug(entry) {
  if (!entry || typeof entry !== "object") {
    return "";
  }
  const raw = entry.slug ?? entry.fullSlug ?? "";
  return String(raw).trim().toLowerCase();
}

export function categoryIdsHasSale(group) {
  const ids = group?.categoryIds;
  if (!Array.isArray(ids)) {
    return false;
  }
  return ids.some((entry) => {
    const s = categoryEntrySlug(entry);
    if (s === "sale") {
      return true;
    }
    if (s.includes("/")) {
      return s.split("/").some((part) => part === "sale");
    }
    return false;
  });
}

function safeTitle(value) {
  if (value && typeof value === "object") {
    return {
      ua: String(value.ua ?? value.uk ?? ""),
      en: String(value.en ?? ""),
      ru: value.ru != null ? String(value.ru) : undefined,
    };
  }
  const s = value != null ? String(value) : "";
  return { ua: s, en: s };
}

function mapCategoryFromGroup(group) {
  const ids = group?.categoryIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    return undefined;
  }
  const first = ids[0];
  if (!first || typeof first !== "object") {
    return undefined;
  }
  const title =
    first.title && typeof first.title === "object"
      ? first.title
      : { ua: String(first.title ?? ""), en: String(first.title ?? "") };
  return { title };
}

function pricingFromPreview(pp) {
  const currency =
    typeof pp?.currency === "string" && pp.currency.trim()
      ? pp.currency.trim()
      : "UAH";
  const raw = pp?.min;
  if (raw == null || raw === "") {
    const empty = { min: "0", currency };
    return mergePricingOld(empty, pp);
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    const empty = { min: "0", currency };
    return mergePricingOld(empty, pp);
  }
  const base = { min: String(Math.round(n)), currency };
  return mergePricingOld(base, pp);
}

function mergePricingOld(target, pp) {
  if (!pp || typeof pp !== "object") {
    return target;
  }
  const rawOld = pp.old;
  if (rawOld == null || rawOld === "") {
    return target;
  }
  const oldNum = Number(rawOld);
  if (!Number.isFinite(oldNum)) {
    return target;
  }
  return {
    ...target,
    old: String(Math.round(oldNum)),
  };
}

export function normalizeCharacterProductRow(row, index) {
  if (!row || typeof row !== "object") {
    return {
      _id: `look-product-missing-${index}`,
      title: { ua: "—", en: "—" },
      imageURL: LOOK_HERO_FALLBACK,
      pricing: { min: "0", currency: "UAH" },
      hasDiscount: false,
    };
  }

  const pg = row.productGroupId;
  if (pg && typeof pg === "object") {
    const _id = String(pg._id ?? `pg-${index}`);
    const title = safeTitle(pg.title);
    const rawUrl =
      typeof pg.imageURL === "string" ? pg.imageURL.trim() : "";
    const imageURL = rawUrl || LOOK_HERO_FALLBACK;
    const basePricing = pg.pricePreview
      ? pricingFromPreview(pg.pricePreview)
      : pg.pricing && typeof pg.pricing === "object"
        ? pricingFromPreview({
            min: pg.pricing.min,
            currency: pg.pricing.currency,
            old: pg.pricing.old,
          })
        : { min: "0", currency: "UAH" };
    const hasDiscount = categoryIdsHasSale(pg);
    const category =
      pg.category ?? mapCategoryFromGroup(pg);

    return {
      _id,
      slug: pg.slug,
      title,
      imageURL,
      pricing: basePricing,
      category,
      hasDiscount,
    };
  }

  const legacy = row;
  const legacyHasSale = categoryIdsHasSale(legacy);
  const legacyBase =
    legacy.pricing && typeof legacy.pricing === "object"
      ? pricingFromPreview({
          min: legacy.pricing.min,
          currency: legacy.pricing.currency,
          old: legacy.pricing.old,
        })
      : { min: "0", currency: "UAH" };

  return {
    ...legacy,
    _id: String(legacy._id ?? legacy.id ?? `legacy-${index}`),
    title: safeTitle(legacy.title),
    imageURL:
      typeof legacy.imageURL === "string" && legacy.imageURL.trim()
        ? legacy.imageURL.trim()
        : LOOK_HERO_FALLBACK,
    pricing: legacyBase,
    category: legacy.category ?? mapCategoryFromGroup(legacy),
    hasDiscount: legacyHasSale,
  };
}

export function normalizeLook(look, index = 0) {
  const rawProducts = Array.isArray(look?.products)
    ? look.products.filter(Boolean)
    : [];

  const hasNestedLinks = rawProducts.some(
    (p) =>
      p &&
      typeof p === "object" &&
      p.productGroupId != null &&
      typeof p.productGroupId === "object",
  );

  const sorted = hasNestedLinks
    ? [...rawProducts].sort(
        (a, b) => Number(a?.position ?? 0) - Number(b?.position ?? 0),
      )
    : rawProducts;

  const products = sorted.map((row, i) => {
    if (!row || typeof row !== "object") {
      return normalizeCharacterProductRow(null, i);
    }
    if (
      row.productGroupId != null &&
      typeof row.productGroupId === "object"
    ) {
      return normalizeCharacterProductRow(row, i);
    }
    return normalizeCharacterProductRow(
      { productGroupId: row },
      i,
    );
  });

  const heroFromLook =
    (typeof look?.heroImageSrc === "string" && look.heroImageSrc.trim()
      ? look.heroImageSrc.trim()
      : null) ??
    (typeof look?.heroImage === "string" && look.heroImage.trim()
      ? look.heroImage.trim()
      : null) ??
    (typeof look?.imageURL === "string" && look.imageURL.trim()
      ? look.imageURL.trim()
      : null);

  const heroImageSrc =
    heroFromLook ??
    (typeof products[0]?.imageURL === "string" && products[0].imageURL
      ? products[0].imageURL
      : LOOK_HERO_FALLBACK);

  const id = String(look?.id ?? look?._id ?? `look-${index}`);

  return { id, heroImageSrc, products };
}

export function getProductSubtitleLine(
  product,
  locale = "ua",
  fallback = "",
) {
  const desc =
    product?.description?.[locale] ??
    product?.description?.ua ??
    product?.description?.en ??
    product?.description?.ru;
  if (typeof desc === "string" && desc.trim()) {
    return desc.trim();
  }
  return getProductCategoryLine(product, locale, fallback);
}

function pickLocalized(obj, locale) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj.trim();
  return (
    obj?.[locale] ??
    obj?.ua ??
    obj?.uk ??
    obj?.en ??
    ""
  ).trim();
}

export function getProductCategoryLine(
  product,
  locale = "ua",
  fallback = "",
) {
  const category =
    product?.category?.title?.[locale] ??
    product?.category?.[locale] ??
    product?.categoryTitle?.[locale] ??
    product?.categoryTitle ??
    product?.category?.title ??
    product?.category;

  const subcategory =
    product?.subcategory?.title?.[locale] ??
    product?.subcategory?.[locale] ??
    product?.subCategory?.title?.[locale] ??
    product?.subCategory?.[locale] ??
    product?.subCategoryTitle?.[locale] ??
    product?.subCategoryTitle ??
    product?.subcategory?.title ??
    product?.subcategory ??
    product?.subCategory?.title ??
    product?.subCategory;

  const parts = [category, subcategory]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);

  if (parts.length) {
    return parts.join(" / ");
  }

  const cats = product?.categories;
  if (Array.isArray(cats) && cats.length > 0) {
    const labels = cats
      .slice(0, 2)
      .map((node) => {
        if (typeof node === "string") return node.trim();
        const t = pickLocalized(node?.title, locale);
        return t || pickLocalized(node, locale);
      })
      .filter(Boolean);
    if (labels.length) {
      return labels.join(" / ");
    }
  }

  const shortSubtitle = pickLocalized(product?.subtitle, locale);
  if (shortSubtitle) {
    return shortSubtitle;
  }

  return fallback || "";
}

const ProductCategory = ({
  product,
  locale = "ua",
  fallback = "",
  /** "subtitle" — опис (якщо є), інакше категорія; "category" — лише категорія / підкатегорія */
  line = "subtitle",
}) => {
  const text =
    line === "category"
      ? getProductCategoryLine(product, locale, fallback)
      : getProductSubtitleLine(product, locale, fallback);

  if (!text) {
    return null;
  }

  return (
    <p className="product-item__text">
      {text}
    </p>
  );
};

export default ProductCategory;


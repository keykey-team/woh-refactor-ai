import {
  getPopularCatalogCards,
  normalizeCatalogCardForProductItem,
} from "@shared";
import PopularProducts from "@widgets/popular-products";

export default async function PopularProductsServerBlock() {
  const result = await getPopularCatalogCards();

  if (!result.ok) {
    return (
      <PopularProducts
        fetchState="error"
        errorMessage={result.message}
        httpStatus={result.status}
        products={[]}
      />
    );
  }

  const normalized = (result.items ?? [])
    .map((raw) => normalizeCatalogCardForProductItem(raw))
    .filter(Boolean)
    .slice(0, 12);

  if (normalized.length === 0) {
    return (
      <PopularProducts
        fetchState="empty"
        products={[]}
      />
    );
  }

  return (
    <PopularProducts
      fetchState="success"
      products={normalized}
    />
  );
}

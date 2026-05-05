import {
  getSaleCatalogCards,
  normalizeCatalogCardForProductItem,
} from "@shared";
import SaleCarousel from "@widgets/sale-carousel";

export default async function SaleCarouselServerBlock({ data }) {
  const result = await getSaleCatalogCards();

  if (!result.ok) {
    return (
      <SaleCarousel
        data={data}
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
    .map((p) => ({ ...p, hasDiscount: true }))
    .slice(0, 20);

  if (normalized.length === 0) {
    return null;
  }

  return (
    <SaleCarousel
      data={data}
      fetchState="success"
      products={normalized}
    />
  );
}

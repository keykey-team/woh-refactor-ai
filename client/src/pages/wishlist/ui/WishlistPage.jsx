"use client";

import ProductItem from "@entities/product";
import { useWishlistItems } from "@entities/wishlist";
import Pagination from "@features/catalog-pagination";
import ProductWishlistButton, { getWishlistProductId } from "@features/toggle-wishlist";
import { PageHeader, useI18n } from "@shared";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const WISHLIST_PAGE_SIZE = 12;
const WISHLIST_DEFAULT_LIMIT = 12;

export default function WishlistPage() {
  const params = useParams();
  const locale = params?.locale ?? "ua";
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const items = useWishlistItems();

  const totalCount = items.length;
  const limitFromQuery = Number(searchParams?.get("limit"));
  const limit = Number.isFinite(limitFromQuery) && limitFromQuery > 0
    ? Math.max(WISHLIST_DEFAULT_LIMIT, limitFromQuery)
    : WISHLIST_DEFAULT_LIMIT;

  const currentPage = Math.max(1, Number(searchParams?.get("page")) || 1);
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const clampedPage = Math.min(currentPage, totalPages);

  const pagedItems = useMemo(() => {
    const start = (clampedPage - 1) * limit;
    return items.slice(start, start + limit);
  }, [clampedPage, items, limit]);

  const WishButton = ({ product }) => <ProductWishlistButton product={product} />;

  return (
    <section className="wishlist-page">
      <PageHeader
        locale={locale}
        breadcrumbsLabels={{
          home: t("breadcrumbs.home"),
          page: t("breadcrumbs.page"),
        }}
        breadcrumbsItems={[{ label: t("wishlist.title") }]}
        title={t("wishlist.title")}
      />

      <div className="container wishlist-page__container">
        {items.length === 0 ? (
          <div className="wishlist-page__empty" role="status">
            {t("wishlist.emptyText")}
          </div>
        ) : (
          <>
            <div className="wishlist-grid">
              {pagedItems.map((product, index) => (
                <ProductItem
                  key={
                    getWishlistProductId({ ...(product ?? {}), __locale: locale }) ??
                    product?._id ??
                    product?.id ??
                    index
                  }
                  product={product}
                  actionButtons={{ WishButton }}
                />
              ))}
            </div>

            <Pagination
              showLoadMore={true}
              pageSize={WISHLIST_PAGE_SIZE}
              moreLabel={t("wishlist.loadMore")}
              data={{ page: clampedPage, pages: totalPages, limit }}
              labels={{
                prev: t("catalog.paginationPrev"),
                next: t("catalog.paginationNext"),
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}

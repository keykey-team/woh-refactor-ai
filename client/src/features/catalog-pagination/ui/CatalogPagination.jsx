"use client";

import { useI18n } from "@shared";
import { CATALOG_PRODUCTS_PAGE_SIZE } from "@shared/api/productsServices";
import { usePathname,useRouter, useSearchParams } from "next/navigation";

export default function CatalogPagination({
  data,
  showLoadMore = true,
  pageSize,
  moreLabel,
  labels = {},
}) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const prevLabel = labels?.prev ?? t("catalog.paginationPrev");
  const nextLabel = labels?.next ?? t("catalog.paginationNext");

  if (!data?.pages || data.pages <= 1) {
    return null;
  }

  const currentPage = data.page;
  const totalPages = data.pages;
  const limit = data.limit;
  const effectivePageSize =
    typeof pageSize === "number" && pageSize > 0
      ? pageSize
      : CATALOG_PRODUCTS_PAGE_SIZE;

  const goToPage = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber <= 1) {
      params.set("page", "1");
    } else {
      params.set("page", String(pageNumber));
    }
    router.push(`${pathname}?${params.toString()}`, {
      scroll: true,
    });
  };

  const loadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    const nextLimit = limit + effectivePageSize;
    params.set("limit", String(nextLimit));
    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const getPagesArray = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('dots');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('dots');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pagesArray = getPagesArray();

  return (
    <div className="catalog-pagination">
      {showLoadMore && currentPage < totalPages && (
        <button
          type="button"
          className="catalog-pagination__button-more"
          onClick={loadMore}
        >
          <p>
            {moreLabel ??
              t("catalog.showMoreWithCount", { count: limit })}
          </p>
        </button>
      )}

      <div className="catalog-pagination__nav-row">
        <button
          type="button"
          className="catalog-pagination__nav-text"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          {prevLabel}
        </button>

        <div className="catalog-pagination__wrapper">
          {pagesArray.map((page, index) => {
            if (page === "dots") {
              return (
                <span
                  key={`dots-${index}`}
                  className="catalog-pagination__dots"
                >
                  …
                </span>
              );
            }

            const label = String(page).padStart(2, "0");

            return (
              <button
                key={page}
                type="button"
                className={`catalog-pagination__item ${
                  currentPage === page ? "is-active" : ""
                }`}
                onClick={() => goToPage(page)}
                aria-current={
                  currentPage === page ? "page" : undefined
                }
              >
                <p>{label}</p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="catalog-pagination__nav-text"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
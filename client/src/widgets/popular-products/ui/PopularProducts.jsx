"use client";

import ProductItem, {
  getProductCategoryLine,
} from "@entities/product";
import { useI18n } from "@shared";
import { useParams } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

function getProductTitle(product, locale, fallback = "") {
  return (
    product?.title?.[locale] ??
    product?.title?.ua ??
    product?.title?.uk ??
    product?.title?.en ??
    product?.title ??
    fallback
  );
}

const PopularProducts = ({
  products = [],
  fetchState = "success",
  errorMessage = "",
  httpStatus,
}) => {
  const sectionId = useId();
  const params = useParams();
  const locale = params?.locale ?? "ua";
  const { t } = useI18n();

  const items = useMemo(
    () => (products ?? []).filter(Boolean),
    [products],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items.length, activeIndex]);

  if (fetchState === "loading") {
    return (
      <section
        className="popular-products popular-products--loading section-margin"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="popular-products__heading">
          <div className="popular-products__skeleton popular-products__skeleton--kicker" />
          <div className="popular-products__skeleton popular-products__skeleton--title" />
        </div>
        <div className="popular-products__accordion popular-products__accordion--skeleton">
          <div className="popular-products__skeleton popular-products__skeleton--nav popular-products__skeleton--block" />
          <div className="popular-products__skeleton popular-products__skeleton--panel popular-products__skeleton--block" />
        </div>
      </section>
    );
  }

  if (fetchState === "error") {
    return (
      <section
        className="popular-products popular-products--error section-margin"
        aria-labelledby={`${sectionId}-err`}
      >
        <div className="popular-products__heading">
          <p className="popular-products__kicker" aria-hidden="true">
            MUST HAVE
          </p>
          <h2
            className="popular-products__title"
            id={`${sectionId}-err`}
          >
            {t("catalog.popularProductsTitle")}
          </h2>
        </div>
        <div className="popular-products__state popular-products__state--error">
          <p className="popular-products__state-text">
            {errorMessage || t("commerce.loadError")}
          </p>
          {httpStatus ? (
            <p className="popular-products__state-meta">
              {t("commerce.responseCode", { code: httpStatus })}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (fetchState === "empty" || items.length === 0) {
    return null;
  }

  const activeProduct = items[activeIndex] ?? items[0];

  const activeProductKey =
    activeProduct?._id ??
    activeProduct?.id ??
    activeProduct?.slug ??
    `popular-${activeIndex}`;

  const tabPanelId = `${sectionId}-panel`;

  return (
    <section
      className="popular-products section-margin"
      aria-labelledby={sectionId}
    >
      <div className="popular-products__heading">
        <p className="popular-products__kicker" aria-hidden="true">
          MUST HAVE
        </p>
        <h2 className="popular-products__title" id={sectionId}>
          {t("catalog.popularProductsTitle")}
        </h2>
      </div>

      <div
        className="popular-products__accordion"
        role="tablist"
        aria-orientation="vertical"
      >
        <div
          className="popular-products__nav"
          aria-label={t("aria.popularList")}
        >
          <ul className="popular-products__list">
            {items.map((item, index) => {
              const rowKey = String(
                item?._id ??
                  item?.id ??
                  item?.slug ??
                  `tab-${index}`,
              );
              const isActive = index === activeIndex;
              return (
                <li
                  key={`${sectionId}-tab-${rowKey}-${index}`}
                  className="popular-products__list-item"
                >
                  <button
                    type="button"
                    role="tab"
                    id={`${sectionId}-tab-${index}`}
                    className={`popular-products__nav-item ${isActive ? "is-active" : ""}`}
                    aria-selected={isActive}
                    aria-controls={tabPanelId}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className="popular-products__nav-title">
                      {getProductTitle(
                        item,
                        locale,
                        t("commerce.genericProduct"),
                      )}
                    </span>
                    <span className="popular-products__nav-subtitle">
                      {getProductCategoryLine(item, locale)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          id={tabPanelId}
          className="popular-products__panel"
          role="tabpanel"
          aria-live="polite"
          aria-labelledby={`${sectionId}-tab-${activeIndex}`}
          aria-label={getProductTitle(
            activeProduct,
            locale,
            t("commerce.genericProduct"),
          )}
        >
          {activeProduct && (
            <div
              className="popular-products__preview"
              key={String(activeProductKey)}
            >
              <div className="popular-products__oval">
                <div className="popular-products__product-card">
                  <ProductItem
                    product={activeProduct}
                    showDiscount={false}
                    showProductMeta={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;

"use client";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import ProductItem from "@entities/product";
import ProductWishlistButton from "@features/toggle-wishlist";
import { BREAKPOINTS, useI18n } from "@shared";
import { useId, useMemo } from "react";
import { Pagination } from "swiper/modules";
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

const SaleCarousel = ({
  data,
  products = [],
  fetchState = "success",
  errorMessage = "",
  httpStatus,
}) => {
  const { t } = useI18n();
  const sectionId = useId();

  const saleItems = useMemo(
    () => (products ?? []).filter(Boolean),
    [products],
  );

  const SaleWishButton = ({ product }) => (
    <ProductWishlistButton product={product} />
  );

  if (fetchState === "loading") {
    return (
      <section
        className="sale-swiper__section sale-swiper__section--loading section-margin"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sale-swiper__bg-letter" aria-hidden="true">
          W
        </p>
        <div className="catalog-swiper__header">
          <div className="sale-swiper__skeleton sale-swiper__skeleton--kicker" />
          <div className="sale-swiper__skeleton sale-swiper__skeleton--title" />
        </div>
        <div className="sale-swiper__skeleton-carousel">
          <div className="sale-swiper__skeleton sale-swiper__skeleton--card" />
          <div className="sale-swiper__skeleton sale-swiper__skeleton--card" />
          <div className="sale-swiper__skeleton sale-swiper__skeleton--card" />
        </div>
      </section>
    );
  }

  if (fetchState === "error") {
    return (
      <section
        className="sale-swiper__section sale-swiper__section--error section-margin"
        aria-labelledby={`${sectionId}-sale-err`}
      >
        <p className="sale-swiper__bg-letter" aria-hidden="true">
          W
        </p>
        <div className="catalog-swiper__header">
          <p className="catalog-swiper__kicker">LIMITED OFFERS</p>
          <h2
            className="catalog-swiper__title"
            id={`${sectionId}-sale-err`}
          >
            {data?.title ?? t("commerce.saleBlockDefaultTitle")}
          </h2>
        </div>
        <div className="sale-swiper__state sale-swiper__state--error">
          <p className="sale-swiper__state-text">
            {errorMessage || t("commerce.loadError")}
          </p>
          {httpStatus ? (
            <p className="sale-swiper__state-meta">
              {t("commerce.responseCode", { code: httpStatus })}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (fetchState !== "success" || saleItems.length === 0) {
    return null;
  }

  return (
    <section className="sale-swiper__section section-margin">
      <p className="sale-swiper__bg-letter" aria-hidden="true">
        W
      </p>

      <div className="catalog-swiper__header">
        <p className="catalog-swiper__kicker">LIMITED OFFERS</p>
        <h2 className="catalog-swiper__title">
          {data?.title ?? t("commerce.saleBlockDefaultTitle")}
        </h2>
      </div>

      <Swiper
        className="catalog-swiper"
        modules={[Pagination]}
        allowTouchMove={true}
        simulateTouch={true}
        touchRatio={1}
        grabCursor={true}
        speed={650}
        slidesPerView={1}
        spaceBetween={16}
        pagination={{
          clickable: true,
          renderBullet: (_, className) =>
            `<button class="${className} sale-swiper__bullet" type="button" aria-label="Sale page"></button>`,
        }}
        breakpoints={{
          [BREAKPOINTS.tablet]: {
            slidesPerView: "auto",
            spaceBetween: 24,
          },
          [BREAKPOINTS.desktop]: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
      >
        {saleItems.map((item, index) => {
          const baseKey = String(
            item?._id ?? item?.id ?? item?.slug ?? "sale",
          );
          return (
            <SwiperSlide
              key={`sale-${baseKey}-${index}`}
            >
              <ProductItem
                product={item}
                showDiscount={true}
                actionButtons={{
                  WishButton: SaleWishButton,
                }}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default SaleCarousel;

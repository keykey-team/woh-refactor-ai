"use client";

import "swiper/css";

import {
  ProductCategory,
  ProductImage,
  ProductPrice,
  ProductTitle,
  resolveProductSlug,
} from "@entities/product";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  LOOK_HERO_FALLBACK,
  normalizeLook,
} from "../lib/normalizeLook";

function LookSetHeroSlide({
  initialSrc,
  className,
}) {
  const [src, setSrc] = useState(initialSrc);

  useEffect(() => {
    setSrc(initialSrc);
  }, [initialSrc]);

  const isRemote =
    src.startsWith("http://") ||
    src.startsWith("https://");

  return (
    <div className="look-set__hero-slide-anchor">
      <Image
        className={className}
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 738px"
        unoptimized={isRemote}
        draggable={false}
        onError={() => {
          setSrc(LOOK_HERO_FALLBACK);
        }}
      />
    </div>
  );
}

function getProductTitle(product, locale) {
  return (
    product?.title?.[locale] ??
    product?.title?.ua ??
    product?.title?.uk ??
    product?.title?.en ??
    product?.title ??
    ""
  );
}

function buildProductPdpHref(product, locale) {
  const slug = resolveProductSlug(product, locale);
  if (!slug) return null;
  const path = String(slug)
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/${locale}/product/${path}`;
}

const LookSet = ({
  looks: looksProp,
  products = [],
  heroImageSrc = LOOK_HERO_FALLBACK,
  fetchState = "success",
  errorMessage = "",
  httpStatus,
}) => {
  const params = useParams();
  const locale = params?.locale ?? "ua";

  const [swiperInstance, setSwiperInstance] =
    useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const resolvedLooks = useMemo(() => {
    if (
      fetchState === "loading" ||
      fetchState === "error" ||
      fetchState === "empty"
    ) {
      return [];
    }

    if (Array.isArray(looksProp) && looksProp.length > 0) {
      return looksProp.map((look, index) =>
        normalizeLook(look, index),
      );
    }

    if (Array.isArray(products) && products.length > 0) {
      return [
        normalizeLook(
          {
            id: "default",
            heroImageSrc,
            products: products.slice(0, 3),
          },
          0,
        ),
      ];
    }

    return [];
  }, [
    fetchState,
    looksProp,
    products,
    heroImageSrc,
  ]);

  const looksSignature = resolvedLooks
    .map((look) => look.id)
    .join("|");

  useEffect(() => {
    setActiveIndex(0);
  }, [looksSignature]);

  const listIndex = Math.min(
    activeIndex,
    Math.max(0, resolvedLooks.length - 1),
  );

  const currentLook = resolvedLooks[listIndex];
  const currentProducts = currentLook?.products ?? [];
  const currentLookId = currentLook?.id ?? "look";

  const handleBulletClick = (index) => {
    setActiveIndex(index);
    requestAnimationFrame(() => {
      swiperInstance?.slideTo?.(index, 0);
    });
  };

  const sectionClass = [
    "look-set",
    "section-margin",
    fetchState === "loading" && "look-set--loading",
    fetchState === "error" && "look-set--error",
    fetchState === "empty" && "look-set--empty",
  ]
    .filter(Boolean)
    .join(" ");

  if (fetchState === "loading") {
    return (
      <section
        className={sectionClass}
        aria-busy="true"
        aria-live="polite"
        aria-labelledby="look-set-heading"
      >
        <div className="look-set__grid look-set__grid--state">
          <div className="look-set__hero look-set__skeleton-block" />
          <div className="look-set__aside look-set__skeleton-aside">
            <div className="look-set__skeleton-line look-set__skeleton-line--short" />
            <div className="look-set__skeleton-line look-set__skeleton-line--title" />
            <div className="look-set__skeleton-line" />
            <div className="look-set__skeleton-line" />
            <div className="look-set__skeleton-line" />
          </div>
        </div>
      </section>
    );
  }

  if (fetchState === "error") {
    return (
      <section
        className={sectionClass}
        aria-labelledby="look-set-heading"
      >
        <div className="look-set__state look-set__state--error">
          <h2
            className="look-set__title"
            id="look-set-heading"
          >
            Не вдалося завантажити образи
          </h2>
          <p className="look-set__state-text">
            {errorMessage ||
              "Спробуйте оновити сторінку пізніше."}
          </p>
          {httpStatus ? (
            <p className="look-set__state-meta">
              Код відповіді: {httpStatus}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (fetchState === "empty") {
    return (
      <section
        className={sectionClass}
        aria-labelledby="look-set-heading"
      >
        <div className="look-set__state look-set__state--empty">
          <h2
            className="look-set__title"
            id="look-set-heading"
          >
            Образів поки немає
          </h2>
          <p className="look-set__state-text">
            Скоро тут зʼявляться добірки — слідкуйте за оновленнями.
          </p>
        </div>
      </section>
    );
  }

  if (resolvedLooks.length === 0) {
    return (
      <section
        className={`${sectionClass} look-set--empty`}
        aria-labelledby="look-set-heading"
      >
        <div className="look-set__state look-set__state--empty">
          <h2
            className="look-set__title"
            id="look-set-heading"
          >
            Образів поки немає
          </h2>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className={sectionClass}
        aria-labelledby="look-set-heading"
      >
        <div className="look-set__grid">
          <div className="look-set__hero">
            <Swiper
              key={looksSignature}
              className="look-set__hero-swiper"
              slidesPerView={1}
              spaceBetween={0}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => {
                const next =
                  swiper.realIndex ??
                  swiper.activeIndex ??
                  0;
                setActiveIndex(next);
              }}
            >
              {resolvedLooks.map((look) => (
                <SwiperSlide
                  key={look.id}
                  className="look-set__hero-slide-wrap"
                >
                  <LookSetHeroSlide
                    initialSrc={look.heroImageSrc}
                    className="look-set__hero-slide"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="look-set__badge" aria-hidden="true">
              <p className="look-set__badge-text">
                Complete the look• 2026•
              </p>
            </div>

            {resolvedLooks.length > 1 ? (
              <div
                className="look-set__pagination"
                role="tablist"
                aria-label="Обрати образ для перегляду товарів"
              >
                {resolvedLooks.map((look, index) => (
                  <button
                    key={look.id}
                    type="button"
                    role="tab"
                    aria-selected={index === listIndex}
                    aria-controls="look-set-product-list"
                    className={`look-set__bullet ${index === listIndex ? "is-active" : ""}`}
                    onClick={() => handleBulletClick(index)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="look-set__aside">
            <p className="look-set__kicker">SHOP THE LOOK</p>
            <h2
              className="look-set__title"
              id="look-set-heading"
            >
              СТВОРИ СВІЙ ВАЙБ
            </h2>

            <ul
              id="look-set-product-list"
              className="look-set__list"
              aria-live="polite"
              aria-atomic="true"
            >
              {currentProducts.map((product, productIndex) => {
                const pdpHref = buildProductPdpHref(
                  product,
                  locale,
                );
                const titleText = getProductTitle(
                  product,
                  locale,
                );

                const thumb = (
                  <div className="product-item--horizontal-thumb">
                    {product?.hasDiscount ? (
                      <span
                        className="product-item__sale-badge"
                        aria-label="SALE"
                      >
                        SALE
                      </span>
                    ) : null}
                    <ProductImage
                      image={
                        product?.imageURL ??
                        product?.imageSrc ??
                        product?.image ??
                        product?.images?.[0]
                      }
                    />
                  </div>
                );

                return (
                  <li
                    key={`${currentLookId}-${String(product?._id ?? productIndex)}`}
                  >
                    <article className="product-item product-item--horizontal">
                      {pdpHref ? (
                        <Link
                          href={pdpHref}
                          className="product-item--horizontal-pdp-link product-item--horizontal-pdp-link--thumb"
                        >
                          {thumb}
                        </Link>
                      ) : (
                        thumb
                      )}

                      <div className="product-item--horizontal-body">
                        {pdpHref ? (
                          <Link
                            href={pdpHref}
                            className="product-item--horizontal-pdp-link product-item--horizontal-pdp-link--title"
                          >
                            <ProductTitle title={titleText} />
                          </Link>
                        ) : (
                          <ProductTitle title={titleText} />
                        )}
                        <div className="product-item--horizontal-category">
                          <ProductCategory
                            product={product}
                            locale={locale}
                          />
                        </div>
                        <div className="product-item--horizontal-price">
                          <ProductPrice
                            price={product?.pricing}
                            hasDiscount={Boolean(
                              product?.hasDiscount,
                            )}
                            quantity={
                              product?.quantityInCart
                            }
                            isBasket={false}
                            showCurrent={true}
                            showOld={true}
                          />
                        </div>
                        <button
                          type="button"
                          className="product-item--horizontal-cta"
                        >
                          ДОДАТИ В КОШИК
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <div
        className="category-marquee category-marquee--with-bg"
        aria-hidden="true"
      >
        <p className="category-marquee__text">
          High Balance Precision Support Flex High Balance Precision Support Flex
          High Balance Precision Support Flex High Balance Precision Support Flex
        </p>
      </div>
    </>
  );
};

export default LookSet;

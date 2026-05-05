"use client";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import {
  ArrowSwiperButton,
  BREAKPOINTS,
  SwiperPagination,
  useI18n,
} from "@shared";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Navigation,
  Pagination,
} from "swiper/modules";
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";


const CatalogCarousel = ({
  locale,
  categories,
}) => {
  const { t } = useI18n();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationWrapRef = useRef(null);

  const [swiperInstance, setSwiperInstance] =
    useState(null);

  const updatePaginationPosition = (swiper) => {
    const paginationEl =
      paginationWrapRef.current?.querySelector(
        ".swiper-pagination-circle",
      );

    if (!paginationEl) return;

    const bullets = paginationEl.querySelectorAll(
      ".swiper-pagination-bullet",
    );

    if (!bullets.length) return;

    const activeIndex =
      swiper.realIndex ?? swiper.activeIndex ?? 0;

    const bulletStyle = window.getComputedStyle(
      bullets[0],
    );

    const bulletWidth = bullets[0].offsetWidth;
    const marginLeft =
      parseFloat(bulletStyle.marginLeft) || 0;
    const marginRight =
      parseFloat(bulletStyle.marginRight) || 0;

    const bulletStep =
      bulletWidth + marginLeft + marginRight;

    let visibleBullets = 3;

    if (
      window.innerWidth >= BREAKPOINTS.desktop
    ) {
      visibleBullets = 5;
    } else if (
      window.innerWidth >= BREAKPOINTS.tablet
    ) {
      visibleBullets = 4;
    }

    let offset = 0;

    if (activeIndex >= visibleBullets - 1) {
      offset =
        (activeIndex - (visibleBullets - 1)) *
        bulletStep;
    }

    const maxOffset = Math.max(
      0,
      bullets.length * bulletStep -
        visibleBullets * bulletStep,
    );

    offset = Math.min(offset, maxOffset);

    paginationEl.style.transform = `translateX(-${offset}px)`;
  };

  useEffect(() => {
    if (!swiperInstance) return;
    if (!prevRef.current) return;
    if (!nextRef.current) return;

    const paginationEl =
      paginationWrapRef.current?.querySelector(
        ".swiper-pagination-circle",
      );

    if (!paginationEl) return;

    swiperInstance.params.navigation.prevEl =
      prevRef.current;
    swiperInstance.params.navigation.nextEl =
      nextRef.current;
    swiperInstance.params.pagination.el =
      paginationEl;

    swiperInstance.navigation.destroy();
    swiperInstance.navigation.init();
    swiperInstance.navigation.update();

    swiperInstance.pagination.destroy();
    swiperInstance.pagination.init();
    swiperInstance.pagination.render();
    swiperInstance.pagination.update();

    requestAnimationFrame(() => {
      updatePaginationPosition(swiperInstance);
    });
  }, [swiperInstance]);

  const fallbackImages = [
    "/img/category-slide-1.webp",
    "/img/category-slide-2.webp",
    "/img/category-slide-3.webp",
  ];

  const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : "";

  const getCategoryImage = (item, index) => {
    const rawImage =
      item?.image?.url ||
      item?.image?.src ||
      item?.imageURL ||
      item?.image;

    if (typeof rawImage === "string" && rawImage.trim()) {
      if (
        rawImage.startsWith("http://") ||
        rawImage.startsWith("https://")
      ) {
        return rawImage;
      }

      if (rawImage.startsWith("/") && apiOrigin) {
        return `${apiOrigin}${rawImage}`;
      }
    }

    return fallbackImages[index % fallbackImages.length];
  };

  const getCategoryTitle = (item) =>
    item?.title?.[locale] ||
    item?.title?.ua ||
    item?.title?.en ||
    item?.slug ||
    t("aria.categoryDefault");

  const getCategoryHref = (item) => {
    const fs =
      typeof item?.fullSlug === "string" && item.fullSlug.trim();
    if (fs) return `/${locale}/categories/${fs}`;
    const rawPath = Array.isArray(item?.path)
      ? item.path.join("/")
      : item?.slug;

    return rawPath
      ? `/${locale}/categories/${rawPath}`
      : `/${locale}/categories/all`;
  };

  const apiSlides = (categories?.items ?? []).map(
    (item, index) => ({
      id: item?._id || item?.slug || `category-${index}`,
      title: getCategoryTitle(item),
      imageURL: getCategoryImage(item, index),
      href: getCategoryHref(item),
    }),
  );

  const slides =
    apiSlides.length > 0
      ? apiSlides
      : fallbackImages.map((imageURL, index) => ({
          id: `fallback-${index}`,
          title:
            index === 0
              ? t("catalog.carouselDemoClothing")
              : index === 1
                ? t("catalog.carouselDemoHeels")
                : t("catalog.carouselDemoAccessories"),
          imageURL,
          href: `/${locale}/categories/all`,
        }));

  return (
    <section className="catalog-swiper__section">
      <Swiper
        className="catalog-swiper"
        modules={[Pagination, Navigation]}
        slidesPerView={1.6}
        spaceBetween={16}
        navigation={false}
        pagination={{
          clickable: true,
        }}
        onSwiper={setSwiperInstance}
        onInit={(swiper) => {
          requestAnimationFrame(() => {
            updatePaginationPosition(swiper);
          });
        }}
        onSlideChange={(swiper) => {
          updatePaginationPosition(swiper);
        }}
        onBreakpoint={(swiper) => {
          requestAnimationFrame(() => {
            updatePaginationPosition(swiper);
          });
        }}
        breakpoints={{
          [BREAKPOINTS.tablet]: {
            slidesPerView: 2.6,
            spaceBetween: 24,
          },
          [BREAKPOINTS.desktop]: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
      >

        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Link href={slide.href} className="category-slide">
              <Image
                src={slide.imageURL}
                alt={slide.title}
                fill
                sizes={`(min-width: ${BREAKPOINTS.desktopNarrow}px) 33vw, (min-width: ${BREAKPOINTS.tablet}px) 50vw, 50vw`}
                className="category-slide__img"
                priority
              />

              <div className="category-slide__content">
                <p className="category-slide__title">{slide.title}</p>
                <p className="category-slide__link">
                  <span className="category-slide__link-text">
                    {t("catalog.carouselCta")}
                  </span>
                  <span
                    className="category-slide__link-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))}

      </Swiper>

      <div className="category-marquee" aria-hidden="true">
        <p className="category-marquee__text">
          High Balance Precision Support Flex High Balance Precision Support Flex
          High Balance Precision Support Flex High Balance Precision Support Flex
        </p>
      </div>

      <div className="catalog-swiper__controls">
        <button
          ref={prevRef}
          type="button"
          className="catalog-swiper__nav catalog-swiper__nav--prev"
          aria-label={t("aria.carouselPrev")}
        >
          <ArrowSwiperButton />
        </button>

        <div
          className="catalog-swiper__wrap"
          ref={paginationWrapRef}
        >
          <SwiperPagination />
        </div>

        <button
          ref={nextRef}
          type="button"
          className="catalog-swiper__nav catalog-swiper__nav--next"
          aria-label={t("aria.carouselNext")}
        >
          <ArrowSwiperButton />
        </button>
      </div>
    </section>
  );
};

export default CatalogCarousel;

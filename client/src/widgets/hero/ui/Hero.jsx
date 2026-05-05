"use client";

import "swiper/css";
import "swiper/css/effect-fade";

import { HOME_BANNER_FALLBACK } from "@shared";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

function isRemoteSrc(src) {
  return /^https?:\/\//i.test(src) || src.startsWith("//");
}

function HeroBannerMedia({ desktopSrc, mobileSrc, link, priority }) {
  const desktop = desktopSrc || HOME_BANNER_FALLBACK;
  const mobile = mobileSrc || desktop;
  const inner = (
    <span className="hero__media-img-wrap">
      <Image
        src={desktop}
        alt=""
        fill
        className="hero__media-img hero__media-img--desktop"
        sizes="100vw"
        priority={priority}
        unoptimized={isRemoteSrc(desktop)}
      />
      <Image
        src={mobile}
        alt=""
        fill
        className="hero__media-img hero__media-img--mobile"
        sizes="100vw"
        priority={priority}
        unoptimized={isRemoteSrc(mobile)}
      />
    </span>
  );

  if (link) {
    const isExternal = /^https?:\/\//i.test(link) || link.startsWith("//");
    if (isExternal) {
      return (
        <a
          href={link}
          className="hero__media-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={link} className="hero__media-link">
        {inner}
      </Link>
    );
  }

  return <div className="hero__media-static">{inner}</div>;
}

const Hero = ({ slides }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePaginationClick = (index) => {
    swiperInstance?.slideTo?.(index);
  };

  const activeSlide = slides[activeIndex] ?? slides[0];

  return (
    <section className="hero-section section-margin">
      <div className="hero">
        <Swiper
          className="hero__swiper"
          modules={[EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={550}
          spaceBetween={0}
          slidesPerView={1}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
          }}
        >
          {slides.map((slide, slideIndex) => (
            <SwiperSlide key={slide.id}>
              <div className="hero__slide">
                <div className="hero__media">
                  <HeroBannerMedia
                    desktopSrc={slide.imageURL}
                    mobileSrc={slide.mobileImageURL}
                    link={slide.link}
                    priority={slideIndex === 0}
                  />
                </div>
                <div className="container hero__container">
                  <div className="hero__content">
                    <p className="hero__kicker">new season 2026</p>

                    <h1 className="hero__title">
                      {slide.title}
                      <span className="hero__title-accent">
                        {slide.lines?.map((line, index) => (
                          <span
                            key={`${slide.id}-accent-${index}`}
                            className={`hero__accent hero__accent--${index + 1}`}
                          >
                            {line}
                          </span>
                        ))}
                      </span>
                    </h1>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {activeSlide ? (
          <div className="hero__cta-layer">
            <div className="container hero__container hero__cta-layer-inner">
              <div className="hero__cta-stack">
                <div className="hero__content hero__cta-ghost" aria-hidden="true">
                  <p className="hero__kicker">new season 2026</p>
                  <h1 className="hero__title">
                    {activeSlide.title}
                    <span className="hero__title-accent">
                      {activeSlide.lines?.map((line, index) => (
                        <span
                          key={`${activeSlide.id}-cta-ghost-${index}`}
                          className={`hero__accent hero__accent--${index + 1}`}
                        >
                          {line}
                        </span>
                      ))}
                    </span>
                  </h1>
                  <div className="hero__actions">
                    <button
                      type="button"
                      className="hero__button"
                      tabIndex={-1}
                      disabled
                    >
                      <p className="hero__text">Дивитись колекцію</p>
                    </button>
                  </div>
                </div>
                <div className="hero__cta-live">
                  <div className="hero__actions">
                    <button className="hero__button" type="button">
                      <p className="hero__text">Дивитись колекцію</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div
          className="hero__pagination"
          role="tablist"
          aria-label="Навігація по слайдах hero"
        >
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              className={`hero__bullet ${i === activeIndex ? "is-active" : ""}`}
              aria-label={`Слайд ${i + 1}`}
              onClick={() => handlePaginationClick(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;

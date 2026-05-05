"use client";

export default function Loading() {
  return (
    <div className="profile-page" aria-busy="true" aria-live="polite">
      <div className="profile-page__prev or">
        <div className="sale-swiper__skeleton sale-swiper__skeleton--kicker" />
        <div className="sale-swiper__skeleton sale-swiper__skeleton--title" />
      </div>

      <div className="profile-ord">
        <div className="sale-swiper__skeleton sale-swiper__skeleton--card" />
      </div>
      <div className="profile-ord">
        <div className="sale-swiper__skeleton sale-swiper__skeleton--card" />
      </div>
    </div>
  );
}


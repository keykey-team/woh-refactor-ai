"use client";

export default function Loading() {
  return (
    <div className="profile-page">
      <div className="profile-page__prev" aria-busy="true" aria-live="polite">
        <div className="sale-swiper__skeleton sale-swiper__skeleton--kicker" />
        <div className="sale-swiper__skeleton sale-swiper__skeleton--title" />
      </div>

      <div className="user-details user-details--profile">
        <div className="sale-swiper__skeleton sale-swiper__skeleton--card" />
        <div className="sale-swiper__skeleton sale-swiper__skeleton--card" />
      </div>
    </div>
  );
}


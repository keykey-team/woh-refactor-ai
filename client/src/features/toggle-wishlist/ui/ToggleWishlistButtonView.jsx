"use client";

import { FavoriteHeart } from "@shared";

export default function ToggleWishlistButtonView({
  isActive,
  ariaLabel,
  buttonBusy,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      className={`product-item__favorite ${
        isActive ? "active" : ""
      } ${className}`.trim()}
      aria-label={ariaLabel}
      aria-busy={buttonBusy}
      disabled={buttonBusy}
      onClick={onClick}
    >
      <FavoriteHeart />
    </button>
  );
}

import { normalizeCatalogCardForProductItem } from "@shared";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export function useWishlistItems() {
  const wishlistItems = useSelector((state) => state.wishlist.items);

  return useMemo(
    () =>
      (wishlistItems ?? [])
        .map((row) => normalizeCatalogCardForProductItem(row) ?? row)
        .filter(Boolean),
    [wishlistItems],
  );
}

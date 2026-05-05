import { CART_MIN_QUANTITY } from "@shared";

export const cartLineId = (item) =>
  item?._id != null
    ? String(item._id)
    : item?.id != null
      ? String(item.id)
      : "";

export function resolvePdpOffer(location, product, activeOffer) {
  if (location !== "prod-page") {
    return null;
  }

  const hasVariationAxes = (product?.variationAxes?.length ?? 0) > 0;
  if (hasVariationAxes) {
    return activeOffer ?? null;
  }

  return activeOffer ?? product?.offers?.[0] ?? null;
}

export function resolveProductId({ isPdp, hasVariationAxes, pdpOffer, product }) {
  if (isPdp && hasVariationAxes) {
    return pdpOffer?._id ?? null;
  }

  return pdpOffer?._id || product?._id || product?.id || product?.offers?.[0]?._id;
}

export function isProductInCart(cartItems, productId) {
  if (productId == null) {
    return undefined;
  }

  return cartItems?.find(
    (item) => String(item?._id || item?.id || item?.offers?.[0]?._id || "") === String(productId),
  );
}

export function resolveMainQuantity(product, isQuantity) {
  return Math.max(
    CART_MIN_QUANTITY,
    Math.floor(Number(product?.quantityInCart || isQuantity || CART_MIN_QUANTITY)) || CART_MIN_QUANTITY,
  );
}

export function resolveCompanionQty(qtyEach) {
  return Math.max(CART_MIN_QUANTITY, Math.floor(Number(qtyEach)) || CART_MIN_QUANTITY);
}

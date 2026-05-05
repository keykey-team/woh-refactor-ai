"use client";

import { useCartButton } from "../model/useCartButton";

const CartButton = ({ location, product, activeOffer, isQuantity, style, companionCartItems = [], getCompanionCartItems }) => {
  const {
    handleAddToCart,
    hasVariationAxes,
    isInCart,
    isOutOfStock,
    isPdp,
    onHand,
    pdpOffer,
    syncPending,
    t,
  } = useCartButton({
    location,
    product,
    activeOffer,
    isQuantity,
    companionCartItems,
    getCompanionCartItems,
  });

  const pdpVariantClass = isPdp
    ? isOutOfStock
      ? "pdp-info__add-to-cart--disabled"
      : "pdp-info__add-to-cart--enabled"
    : "";

  const pdpPrimaryLabel = () => {
    if (!isPdp) return "";
    if (!pdpOffer) {
      if (hasVariationAxes) return t("commerce.cartButton.chooseVariant");
      return (product?.offers?.length ?? 0) === 0
        ? t("commerce.cartButton.priceOnRequest")
        : t("commerce.cartButton.outOfStock");
    }

    if (pdpOffer.available === false) return t("commerce.cartButton.outOfStock");
    return t("commerce.cartButton.addToCart");
  };

  const disabledBase = isPdp ? isOutOfStock : product?.variations?.variations?.[0]?.quantity === 0;
  const disabledPrimary = isPdp
    ? isOutOfStock || syncPending
    : (product?.pricing?.min === 0 || product?.pricing?.max === 0) || syncPending;

  const label = isPdp
    ? isOutOfStock
      ? pdpPrimaryLabel()
      : isInCart
        ? t("commerce.cartButton.inCart")
        : t("commerce.cartButton.addToCart")
    : onHand === 0
      ? t("commerce.cartButton.restock")
      : isInCart
        ? t("commerce.cartButton.inCart")
        : t("commerce.cartButton.addToCartShort");

  const buttonClass = isPdp
    ? `${style || ""} ${pdpVariantClass}`.trim()
    : isInCart
      ? style || "product-item__button active"
      : `product-item__button ${product?.variations?.variations?.[0]?.quantity === 0 ? "productItem__button-waiting" : ""} ${style || ""}`;

  return (
    <button
      type="button"
      className={buttonClass}
      disabled={isInCart ? disabledPrimary : disabledBase || syncPending}
      onClick={(event) => {
        event.stopPropagation();
        if (isPdp && isOutOfStock) return;
        void handleAddToCart();
      }}
    >
      <p>{label}</p>
    </button>
  );
};

export default CartButton;

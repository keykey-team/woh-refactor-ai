import { addToCartAsync, incrementQuantityAsync } from "@entities/cart";
import { MODALS, useI18n, useModals } from "@shared";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  cartLineId,
  isProductInCart,
  resolveCompanionQty,
  resolveMainQuantity,
  resolvePdpOffer,
  resolveProductId,
} from "../lib/cartButtonHelpers";

export function useCartButton({ location, product, activeOffer, isQuantity, companionCartItems, getCompanionCartItems }) {
  const { setIsModalOpen, setIsProdModalId } = useModals();
  const { t } = useI18n();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const cartItems = useSelector((state) => state.cart.items);
  const syncPending = useSelector((state) => state.cart.syncPending);

  const isPdp = location === "prod-page";
  const hasVariationAxes = (product?.variationAxes?.length ?? 0) > 0;
  const pdpOffer = resolvePdpOffer(location, product, activeOffer);

  const productId = useMemo(
    () => resolveProductId({ isPdp, hasVariationAxes, pdpOffer, product }),
    [hasVariationAxes, isPdp, pdpOffer, product],
  );

  const isInCart = useMemo(() => isProductInCart(cartItems, productId), [cartItems, productId]);

  const offerForStock = pdpOffer ?? product?.offers?.[0];
  const onHand = offerForStock?.stocks?.[0]?.onHand;
  const isOutOfStock = isPdp
    ? !pdpOffer || pdpOffer.available === false
    : onHand === 0 ||
      product?.availability?.hasAvailable === false ||
      product?.variations?.variations?.[0]?.quantity === 0;

  const resolveCompanionLines = useCallback(async () => {
    if (typeof getCompanionCartItems === "function") {
      try {
        const rows = await getCompanionCartItems();
        return Array.isArray(rows) ? rows : [];
      } catch (error) {
        console.warn("[cart] getCompanionCartItems failed", error);
        return [];
      }
    }

    return Array.isArray(companionCartItems) ? companionCartItems : [];
  }, [companionCartItems, getCompanionCartItems]);

  const addCompanionLines = useCallback(
    async (lines, qtyEach) => {
      if (!lines?.length) return;

      const mainId = String(productId);
      const qty = resolveCompanionQty(qtyEach);
      for (const line of lines) {
        const offerId = cartLineId(line);
        if (!offerId || offerId === mainId) continue;
        try {
          await dispatch(addToCartAsync({ ...line, quantityInCart: qty })).unwrap();
        } catch (error) {
          console.warn(`[cart] companion offer ${offerId} add failed`, error);
        }
      }
    },
    [dispatch, productId],
  );

  const handleAddToCart = useCallback(async () => {
    if ((isPdp && !pdpOffer) || syncPending) {
      return;
    }

    if (!productId) {
      console.error(t("commerce.cartButton.missingProductId"), product);
      return;
    }

    setIsProdModalId(productId);
    const mainQty = resolveMainQuantity(product, isQuantity);

    try {
      if (!isInCart) {
        const payload =
          pdpOffer != null
            ? { ...product, _id: productId, offers: [pdpOffer], quantityInCart: mainQty }
            : { ...product, _id: productId, quantityInCart: mainQty };

        await dispatch(addToCartAsync(payload)).unwrap();
        const companions = await resolveCompanionLines();
        await addCompanionLines(companions, mainQty);
      } else {
        await dispatch(incrementQuantityAsync(productId)).unwrap();
        const companions = await resolveCompanionLines();
        await addCompanionLines(companions, 1);
      }
    } catch (error) {
      console.error(error);
    }

    if (!(pathname || "").includes("/cart")) {
      setIsModalOpen(MODALS.BASKET);
    }
  }, [
    addCompanionLines,
    dispatch,
    isInCart,
    isPdp,
    isQuantity,
    pathname,
    pdpOffer,
    product,
    productId,
    resolveCompanionLines,
    setIsModalOpen,
    setIsProdModalId,
    syncPending,
    t,
  ]);

  return { handleAddToCart, hasVariationAxes, isInCart, isOutOfStock, isPdp, onHand, pdpOffer, productId, syncPending, t };
}

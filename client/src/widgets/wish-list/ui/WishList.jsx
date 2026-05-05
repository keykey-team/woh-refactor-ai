"use client";

import ProductItem from "@entities/product";
import CartButton from "@features/cart-buttons";
import Counter from "@features/counter";
import WishlistButton from "@features/toggle-wishlist";
import { normalizeCatalogCardForProductItem } from "@shared";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const WishList = ({ isEmpty }) => {
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const items = useMemo(
    () =>
      (wishlistItems ?? [])
        .map((row) => normalizeCatalogCardForProductItem(row) ?? row)
        .filter(Boolean),
    [wishlistItems],
  );

  return (
    <section className="wishlist section-margin">
      {isEmpty ? (
        <div className="wishlist-empty">Ваш вішлист порожній</div>
      ) : (
        <ul className="wishlist-grid">
          {items.map((item, index) => (
            <li
              key={item?._id ?? item?.id ?? item?.slug ?? index}
              className="wishlist-grid__item"
            >
              <ProductItem
                product={item}
                actionButtons={{
                  CartButton: () => (
                    <CartButton location="prod-item" product={item} />
                  ),
                  WishButton: () => (
                    <WishlistButton
                      product={item}
                      className="wishlist-button"
                    />
                  ),
                  Counter: (props) => (
                    <Counter prod={props?.product || item} />
                  ),
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* <Pagination /> */}
    </section>
  );
};

export default WishList;

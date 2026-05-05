"use client";

import LanguageDropdown from "@features/language-switcher";
import SearchModal from "@features/search-modal";
import {
  headerActionsList,
  MODALS,
  useModals,
  useOnClickOutside,
} from "@shared";
import Basket from "@widgets/basket";
import BurgerMenu from "@widgets/burger-menu";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const HeaderActions = ({
  headerNavItems,
  burgerNavItems,
  categories,
  locale,
  labels,
  searchLabels,
}) => {
  const { isModalOpen, setIsModalOpen } = useModals();
  const router = useRouter();

  const id_token = Cookies.get("auth_token");

  const cartItems = useSelector((state) => state.cart.items) ?? [];
  const cartTotalQty = Array.isArray(cartItems) ? cartItems.reduce(
    (sum, item) => sum + Math.max(0, Number(item?.quantityInCart) || 0),
    0,
  ) : 0;

  const [mounted, setMounted] = useState(false);
  const languageSwitcherRootRef = useRef(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  useOnClickOutside(
    languageSwitcherRootRef,
    () => setIsModalOpen(null),
    isModalOpen === MODALS.LANGUAGE,
  );

  const toggleModal = (modal) => {
    setIsModalOpen(isModalOpen === modal ? null : modal);
  };

  const onActionClick = (id) => {
    if (id === "search") return toggleModal(MODALS.SEARCH);

    if (id === "lang") return toggleModal(MODALS.LANGUAGE);

    if (id === "menu") return toggleModal(MODALS.BURGER);

    if (id === "basket") return toggleModal(MODALS.BASKET);

    if (id === "favorite") return router.push(`/${locale}/wishlist`);

    if (id === "profile")
      return id_token
        ? router.push(`/${locale}/profile/info`)
        : toggleModal(MODALS.LOGIN);

    if (id === "favorite") {
      router.push(`/${locale}/wishlist`);
      return;
    }
  };

  return (
    <>
      <ul className="header-actions">
        {headerActionsList.map(({ id, label, Icon }, index) => (
          <li
            key={index}
            ref={id === "lang" ? languageSwitcherRootRef : undefined}
            className={`header-actions__item ${id === "lang" ? "lang-switcher" : ""}`}
            data-id={id}
          >
            <button
              type="button"
              aria-label={label}
              className="header-actions__button"
              onClick={
                id === "search" ||
                id === "lang" ||
                id === "menu" ||
                id === "profile" ||
                id === "basket" ||
                id === "favorite"
                  ? () => onActionClick(id)
                  : undefined
              }
            >
              <Icon />

              {id === "basket" &&
                mounted &&
                cartTotalQty > 0 &&
                (() => {
                  const text = cartTotalQty > 99 ? "99+" : String(cartTotalQty);
                  const isSingle = text.length === 1;

                  return (
                    <span
                      className={`header-actions__badge ${isSingle ? "header-actions__badge--single" : ""}`}
                      aria-label={`${labels.basketCount}: ${text}`}
                    >
                      {text}
                    </span>
                  );
                })()}
            </button>

            {id === "lang" && <LanguageDropdown />}

            {id === "search" && (
              <SearchModal
                locale={locale}
                isOpen={isModalOpen === MODALS.SEARCH}
                onClose={() => setIsModalOpen(null)}
                labels={searchLabels}
              />
            )}
          </li>
        ))}
      </ul>

      <BurgerMenu
        categories={categories}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        navItems={headerNavItems}
        burgerNavItems={burgerNavItems}
        locale={locale}
      />

      <Basket locale={locale} />
    </>
  );
};

export default HeaderActions;
"use client";

import { useLanguageSwitcher } from "@features/language-switcher/model/useLanguageSwitcher";
import MainNav, {
  AccountIcon,
  ArrowMoreIcon,
  Basket,
  BurgerMenuCatalog,
  CloseBtn,
  FavoriteProductIcon,
  LanguageSwitcher,
  Logo,
} from "@shared";
import { MODALS } from "@shared/config/modals";
import { useI18n } from "@shared/i18n/use-i18n";
import SocialLinks from "@shared/ui/SocialLinks";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BurgerMenuCatalogTree from "./BurgerMenuCatalogTree";

const BurgerMenu = ({
  categories,
  isModalOpen,
  setIsModalOpen,
  navItems,
  burgerNavItems,
  locale
}) => {
  const LANGS = [
    {
      locales: "ua",
      labelKey: "language.ukrainian",
      code: "UA",
      index: 1

    },
    {
      locales: "en",
      labelKey: "language.english",
      code: "EN",
      index: 2
    },
  ];
  const { t } = useI18n();
  const { currentLocale, isOpen, onSelect } =
    useLanguageSwitcher();
  const isOpenModal = isModalOpen === MODALS.BURGER;
  const [isCatalogOpen, setIsCatalogOpen] =
    useState(false);
  const router = useRouter();
  const id_token = Cookies.get("auth_token");

  const closeBurger = () => setIsModalOpen(null);
  const handleNavClickCapture = (e) => {
    const target = e?.target;
    if (!target || typeof target.closest !== "function") return;
    if (target.closest("a")) {
      closeBurger();
    }
  };
  return (
    <>
      {isOpenModal && (
        <div
          className="burger-menu__overlay"
          onClick={closeBurger}
        />
      )}

      <div
        className={`burger-menu ${isOpenModal ? "open" : ""}`}
      >
        <div className="burger-menu__header">
          <Link href={`/${locale}`} aria-label={t("aria.homeLogo")} onClick={closeBurger}>
            <Logo />
          </Link>

          <button
            type="button"
            className="burger-menu__close"
            onClick={closeBurger}
            aria-label={t("aria.closeMenu")}
          >
            <CloseBtn />
          </button>
        </div>

        <div className="burger-menu__inner" onClickCapture={handleNavClickCapture}>
          <button
            type="button"
            className={`burger-menu-catalog ${isCatalogOpen ? "is-open" : ""}`}
            onClick={() =>
              setIsCatalogOpen((v) => !v)
            }
            aria-expanded={isCatalogOpen}
          >
            <div>
              <BurgerMenuCatalog />
              <h2 className="burger-menu-catalog__title">
                {t("catalogSection.title")}
              </h2>
            </div>

            <span className="burger-menu-catalog__arrow">
              <ArrowMoreIcon />
            </span>
          </button>

          {isCatalogOpen && (
            <div className="burger-menu-catalog__dropdown">
              <BurgerMenuCatalogTree
                locale={locale}
                roots={categories?.items ?? []}
                onNavigate={() => {
                  setIsCatalogOpen(false);
                  closeBurger();
                }}
              />
            </div>
          )}

          <div className="burger-menu-catalog__dropdown">
            <MainNav navItems={burgerNavItems ?? navItems} />
          </div>


          <div className="lang-dropdown">
            <LanguageSwitcher />

            <div className="lang-dropdown__content">
              <h3 className="lang-dropdown__title">
                Обрати мову
              </h3>

              <ul className="lang-dropdown__list">
                {LANGS.map(
                  ({ locales, labelKey, code, Icon, index }) => (

                    <li key={index} onClick={() => onSelect(locales)} className={locales !== locale ? "lang-dropdown__item" : "lang-dropdown__item active"}>
                      <p>{code}</p>
                    </li>


                  ),
                )}
              </ul>

            </div>
          </div>

          <button
            type="button"
            className="account-user"
            onClick={() => {
              closeBurger();
              if (id_token) {
                router.push(`/${locale}/profile/info`);
                return;
              }
              setIsModalOpen(MODALS.LOGIN);
            }}
          >
            <AccountIcon />

            <p className="account-user__text">
              Вхід в особистий кабінет
            </p>
          </button>

          <Link
            className="favorite-product"
            href={`/${locale}/wishlist`}
            onClick={() => closeBurger()}
          >
            <FavoriteProductIcon />

            <p className="favorite-product__text">
              Обрані товари
            </p>
          </Link>

          <button
            type="button"
            className="basket-shortcut"
            onClick={() => {
              setIsModalOpen(MODALS.BASKET);
            }}
          >
            <Basket />
            <p className="basket-shortcut__text">Кошик</p>
          </button>

          <Link
            className="catalog-shortcut"
            href={`/${locale}/categories/all`}
            onClick={() => closeBurger()}
          >
            <BurgerMenuCatalog />
            <p className="catalog-shortcut__text">Каталог</p>
          </Link>

          <div className="burger-menu-contact">
            <div>
              <h3 className="burger-menu-contact__title">
                Телефон
              </h3>

              <ul className="burger-menu-contact__list">
                <li className="burger-menu-contact__item">
                  <a
                    className="burger-menu-contact__link"
                    href="tel:+380955616826"
                  >
                    +380 (95) 561-68-26
                  </a>
                </li>
                <li className="burger-menu-contact__item">
                  <a
                    className="burger-menu-contact__link"
                    href="tel:+380687527128"
                  >
                    +380 (68) 752-71-28
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="burger-menu-contact__title">
                По всім питанням та пропозиціям
              </h3>

              <a
                className="burger-menu-contact__link"
                href="mailto:world.of.heelss@gmail.com"
              >
                world.of.heelss@gmail.com
              </a>
            </div>

            <div>
              <h3 className="burger-menu-contact__title">
                Соціальні мережі
              </h3>
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BurgerMenu;

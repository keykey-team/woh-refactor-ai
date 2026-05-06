import MainNav, {
  CloseBtn,
  createI18nServer,
  getAllFilters,
  getLocalizedNavigation,
  getMessages,
  Logo,
} from "@shared";
import Link from "next/link";

import HeaderActions from "./HeaderActions";
import AuthModal from "@widgets/auth-modal";
import MegaMenu from "./MegaMenu";


export default async function Header({
  locale,
  categories,
}) {


  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);

  const { headerNavItems, footerNavItems, burgerNavItems } =
    getLocalizedNavigation(t, locale);

  const catalogFacets = await getAllFilters({}, undefined, locale);

  return (
    <>

      <AuthModal />
      <header className="header">
        <div className="container">
          <div className="header__inner">
            <Link
              href={`/${locale}`}
              className="header__logo"
              aria-label={t("aria.homeLogo")}
            >
              <Logo />
            </Link>
            <nav className="header__nav">
              <MainNav
                locale={locale}
                navItems={headerNavItems}
                catalogTreeRoots={categories?.items ?? []}
                catalogDropdown={
                  <MegaMenu
                    locale={locale}
                    catalogTreeRoots={categories?.items ?? []}
                    filters={catalogFacets}
                  />
                }
              />
            </nav>
            {true ? (
              <HeaderActions

                locale={locale}
                categories={categories}
                headerNavItems={footerNavItems}
                burgerNavItems={burgerNavItems}
                labels={{
                  basketCount: t(
                    "basket.basketCount",
                  ),
                }}
                searchLabels={{
                  placeholder: t(
                    "search.placeholder",
                  ),
                  close: t("search.close"),
                  popular: t("search.popular"),
                }}
              />
            ) : (
              <CloseBtn />
            )}
          </div>
        </div>
      </header>
    </>
  );
}

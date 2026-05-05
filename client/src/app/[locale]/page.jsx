import {
  createI18nServer,
  getAllCategory,
  getLocalizedCatalogSection,
  getLocalizedFooter,
  getMessages,
} from "@shared";
import CatalogCarousel from "@widgets/catalog-carousel";
import Footer from "@widgets/Footer";
import { HeroSkeleton } from "@widgets/hero";
import PopularProducts from "@widgets/popular-products";
import SaleCarousel from "@widgets/sale-carousel";
import { Suspense } from "react";
import HeroServerBlock from "./HeroServerBlock";
import LookSetServerBlock from "./LookSetServerBlock";
import PopularProductsServerBlock from "./PopularProductsServerBlock";
import SaleCarouselServerBlock from "./SaleCarouselServerBlock";
export const revalidate = 259200; 

export async function generateStaticParams() {
  return [{ locale: 'ua' }, { locale: 'en' }]; 
}

export default async function HomePage({
  params,
}) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const footerData = getLocalizedFooter(t);

  const catalogSection = getLocalizedCatalogSection(t);
  const saleSection = {
    title: t("home.saleOffersTitle"),
    allCatalog: t("home.allCatalogCta"),
  };
  const categories = await getAllCategory();

  return (
    <main>
      {/* Остальная разметка остается без изменений */}
      <div className="container">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroServerBlock locale={locale} />
        </Suspense>
        <CatalogCarousel
          data={catalogSection}
          locale={locale}
          categories={categories}
        />
        <Suspense
          fallback={
            <SaleCarousel
              data={saleSection}
              fetchState="loading"
              products={[]}
            />
          }
        >
          <SaleCarouselServerBlock data={saleSection} />
        </Suspense>
      </div>

      <section className="products-layout-wrapper products-layout-wrapper--home">
        <div className="container products-layout-wrapper__inner">
          <Suspense fallback={<PopularProducts fetchState="loading" />}>
            <PopularProductsServerBlock />
          </Suspense>
          <Suspense fallback={null}>
            <LookSetServerBlock />
          </Suspense>
        </div>
        <Footer
          categories={categories}
          locale={locale}
          data={footerData}
        />
      </section>
    </main>
  );
}
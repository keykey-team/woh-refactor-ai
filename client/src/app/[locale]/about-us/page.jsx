import {
  AboutUs,
  getLocalizedAbout,
} from "views/index";
import {
  createI18nServer,
  getAllCategory,
  getLocalizedFooter,
  getMessages,
} from "@shared";
import Footer from "@widgets/Footer";

export default async function AboutUsPage({ params }) {
  const { locale = "ua" } = await params;
  const categories = await getAllCategory();
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const aboutData = getLocalizedAbout(t);
  const footerData = getLocalizedFooter(t);

  return (
    <>
      <div className="container">
        <AboutUs data={aboutData} />
      </div>
      <section className="products-layout-wrapper products-layout-wrapper--footer">
        <div className="container products-layout-wrapper__inner" />
        <Footer categories={categories} locale={locale} data={footerData} />
      </section>
    </>
  );
}

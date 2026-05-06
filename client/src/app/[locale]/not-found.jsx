import AppProviders from "../providers";
import NotFoundPage from "views/not-found-page";
import {
  createI18nServer,
  getAllCategory,
  getLocalizedFooter,
  getMessages,
} from "@shared";

import Footer from "@widgets/Footer";


async function resolveMessages(locale) {
  try {
    return await getMessages(locale);
  } catch {
    try {
      return await getMessages("ua");
    } catch {
      return {};
    }
  }
}

export default async function NotFound({
  params,
}) {
  const resolvedParams = params != null ? await params : { locale: "ua" };
  const { locale = "ua" } = resolvedParams;

  let categories = [];
  try {
    categories = await getAllCategory();
  } catch {
    categories = [];
  }

  const messages = await resolveMessages(locale);
  const { t } = createI18nServer(messages);
  const footerData = getLocalizedFooter(t);

  return (
    <AppProviders
      locale={locale}
      messages={messages}
    >
      <div className="not-found-page-shell">
        <NotFoundPage locale={locale} />
        <section className="products-layout-wrapper products-layout-wrapper--footer">
          <div className="container products-layout-wrapper__inner" />
          <Footer
            categories={categories}
            locale={locale}
            data={footerData}
          />
        </section>
      </div>
    </AppProviders>
  );
}

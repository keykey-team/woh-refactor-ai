import AppProviders from "../providers";
import {
  getAllCategory,
  getMessages,
  i18n,
  MainContent,
} from "@shared";
import Header from "@widgets/Header";
import { notFound } from "next/navigation";

export default async function LocaleLayout({
  children,
  params,
}) {
  const categories = await getAllCategory();
  const { locale = "ua" } = await params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <AppProviders
      locale={locale}
      messages={messages}
    >
      <div className="layout">
        <Header
          locale={locale}
          categories={categories}
        />
        <MainContent locale={locale}>
          {children}
        </MainContent>
      </div>
    </AppProviders>
  );
}
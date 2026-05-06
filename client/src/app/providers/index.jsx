"use client";

import { I18nProvider, ModalsProvider, ToastProvider } from "@shared";
import { Provider } from "react-redux";

import store from "../store/store";

export default function AppProviders({ children, locale, messages }) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <ToastProvider>
        <ModalsProvider>
          <Provider store={store}>{children}</Provider>
        </ModalsProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

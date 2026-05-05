"use client";

import { Provider } from "react-redux";

import { I18nProvider } from "../i18n/use-i18n";
import { ModalsProvider } from "../lib/modalsContext";
import { ToastProvider } from "../lib/toastContext";
import store from "../redux/store/store";

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
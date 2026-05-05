// src/shared/providers/index.jsx
"use client";

import { I18nProvider, ModalsProvider, ToastProvider } from "@shared";

export default function Providers({ children, locale, messages }) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <ToastProvider>
        <ModalsProvider>{children}</ModalsProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
"use client";

import { useI18n } from "@shared";
import PageHeader from "@shared/ui/PageHeader";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function NotFoundPage({ locale: localeFromServer }) {
  const params = useParams();
  const locale = localeFromServer ?? params?.locale ?? "ua";
  const { t } = useI18n();

  const breadcrumbsLabels = useMemo(() => ({
    home: t("breadcrumbs.home"),
    page: t("breadcrumbs.page"),
  }), [t]);

  const title = t("notFound.title");
  const breadcrumbsItems = useMemo(() => ([
    { label: title },
  ]), [title]);

  return (
    <section className="not-found-page">
      <PageHeader
        locale={locale}
        breadcrumbsLabels={breadcrumbsLabels}
        breadcrumbsItems={breadcrumbsItems}
        title={title}
      />

      <div className="not-found-page__container">
        <div className="not-found-page__inner">
          <div className="not-found-page__code" aria-hidden="true">
            <span className="not-found-page__digit">4</span>
            <span className="not-found-page__zero">
              <span className="not-found-page__zero-dot" />
            </span>
            <span className="not-found-page__digit">4</span>
          </div>

          <p className="not-found-page__line1">
            {t("notFound.line1")}
          </p>
          <p className="not-found-page__line2">
            {t("notFound.line2")}
          </p>
          <p className="not-found-page__desc">
            {t("notFound.description")}
          </p>

          <Link
            href={`/${locale}`}
            className="not-found-page__cta"
          >
            {t("notFound.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}

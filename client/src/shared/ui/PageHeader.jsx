"use client";

import Breadcrumbs from "@widgets/brad-crumps";

export default function PageHeader({
  locale,
  breadcrumbsItems,
  breadcrumbsLabels,
  title,
}) {
  return (
    <header className="page-header">
      <Breadcrumbs
        locale={locale}
        labels={breadcrumbsLabels}
        items={breadcrumbsItems}
      />

      <div className="container">
        <div className="page-header__header">
          <h1 className="page-header__title">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}


"use client";

import { useRouter } from "next/navigation";
import React from "react";

import Split from "./common/Split";

const Breadcrumbs = ({
  locale,
  labels = { home: "Home", page: "Page" },
  items,
  categoryName,
  categoryLink,
  subcategoryLink,
  subcategoryName,
  productName,
  pageName,
}) => {
  const router = useRouter();
  const go = (path) => router.push(path);
  const normalizedItems = Array.isArray(items)
    ? items.filter((x) => x && typeof x.label === "string" && x.label.trim().length)
    : null;

  return (
    <div className="breadcrumbs">
      <div className="container">
        <p
          className="breadcrumbs__link home"
          onClick={() => go(`/${locale}`)}
        >
          {labels.home}
        </p>

        <Split />

        {normalizedItems ? (
          normalizedItems.map((item, index) => {
            const isLast = index === normalizedItems.length - 1;
            const canGo = !isLast && typeof item.path === "string" && item.path.trim().length;

            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <p
                  className={`breadcrumbs__link${isLast ? " active" : ""}`}
                  onClick={canGo ? () => go(item.path) : undefined}
                >
                  {item.label}
                </p>
                {!isLast ? <Split /> : null}
              </React.Fragment>
            );
          })
        ) : categoryName ? (
          <>
            <p
              className={`breadcrumbs__link${subcategoryName || productName ? "" : " active"}`}
              onClick={() =>
                go(
                  `/${locale}/categories/${categoryLink}`,
                )
              }
            >
              {categoryName}
            </p>

            {subcategoryName ? (
              <>
                <Split />
                <p
                  className={`breadcrumbs__link${productName ? "" : " active"}`}
                  onClick={() =>
                    go(
                      `/${locale}/categories/${categoryLink}/${subcategoryLink}`,
                    )
                  }
                >
                  {subcategoryName}
                </p>
              </>
            ) : null}

            {productName ? (
              <>
                <Split />
                <p className="breadcrumbs__link active">
                  {productName}
                </p>
              </>
            ) : null}
          </>
        ) : (
          <p className="breadcrumbs__link active">
            {pageName ?? labels.page}
          </p>
        )}
      </div>
    </div>
  );
};

export default Breadcrumbs;
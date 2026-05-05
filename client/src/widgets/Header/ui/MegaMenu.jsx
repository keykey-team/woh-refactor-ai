"use client";

import Link from "next/link";

import { sortCategoriesBySort } from "@features/catalog-filter";
import {
  categoryNodeProductCount,
  resolveCategoryFacetCount,
} from "@features/catalog-filter";
import { categoryTreeItemHref } from "@shared/lib/categoryTreeHref";

function titleFor(cat, locale) {
  return (
    cat?.title?.[locale] ??
    cat?.title?.ua ??
    cat?.title?.uk ??
    cat?.title?.en ??
    cat?.slug ??
    ""
  );
}

function isSaleCategory(cat) {
  const slug = String(cat?.slug ?? "").toLowerCase();
  const t = cat?.title && typeof cat.title === "object" ? cat.title : null;
  const anyTitle = t ? Object.values(t).join(" ") : "";
  const s = `${slug} ${anyTitle}`.toLowerCase();
  return s.includes("sale") || s.includes("розпрод") || s.includes("розпродаж");
}

function splitIntoColumns(items, columnsCount) {
  const cols = Array.from({ length: columnsCount }, () => []);
  items.forEach((it, idx) => cols[idx % columnsCount].push(it));
  return cols;
}

export default function MegaMenu({
  locale = "ua",
  catalogTreeRoots = [],
  filters,
}) {
  const rootsSorted = sortCategoriesBySort(
    Array.isArray(catalogTreeRoots) ? catalogTreeRoots : [],
  );

  const columns = splitIntoColumns(rootsSorted, 3);

  return (
    <div className="mega-menu" role="dialog" aria-label="Catalog menu">
      <div className="mega-menu__panel">
        <div className="mega-menu__lookbook" aria-hidden="true">
          <div className="mega-menu__lookbook-card">
            <div className="mega-menu__lookbook-media" />
            <p className="mega-menu__lookbook-title">LOOKBOOK 2026</p>
          </div>
        </div>

        <div className="mega-menu__columns">
          {columns.map((col, colIdx) => (
            <div className="mega-menu__col" key={colIdx}>
              {col.map((root) => {
                const rootTitle = titleFor(root, locale);
                const children = sortCategoriesBySort(root?.children ?? []);

                return (
                  <div
                    className="mega-menu__group"
                    key={root?._id ?? root?.slug ?? rootTitle}
                  >
                    <Link
                      href={categoryTreeItemHref(locale, root)}
                      className="mega-menu__group-title"
                    >
                      {rootTitle}
                    </Link>

                    {children.length > 0 ? (
                      <ul className="mega-menu__list">
                        {children.map((child) => {
                          const childTitle = titleFor(child, locale);
                          const facetCount = resolveCategoryFacetCount(
                            filters,
                            child?._id,
                          );
                          const fallback = categoryNodeProductCount(child);
                          const rawCount =
                            facetCount != null ? facetCount : fallback;
                          const countDisplay =
                            rawCount != null && Number.isFinite(Number(rawCount))
                              ? Math.max(0, Math.round(Number(rawCount)))
                              : null;
                          return (
                            <li
                              className="mega-menu__item"
                              key={child?._id ?? child?.slug ?? childTitle}
                            >
                              <Link
                                href={categoryTreeItemHref(locale, child)}
                                className="mega-menu__link"
                              >
                                <span className="mega-menu__link-title">
                                  {childTitle}
                                </span>
                                {countDisplay != null ? (
                                  <span className="mega-menu__count">
                                    {` (${countDisplay})`}
                                  </span>
                                ) : null}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


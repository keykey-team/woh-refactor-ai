import {
  QUERY_CATEGORY_IDS,
  QUERY_CHAR,
  QUERY_OFFER_CHAR,
  QUERY_ONLY_AVAILABLE,
  QUERY_OPT,
  QUERY_PAGE,
  QUERY_PRICE_MAX,
  QUERY_PRICE_MIN,
} from "@shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { findCategoryByFullSlug, sortCategoriesBySort } from "../lib/categoryTreeFlatten";
import { pickLocalizedField, prepareFilterableMetaItems } from "../lib/characteristicsMetaHelpers";

function parseCategoriesPathFromPathname(pathname, locale) {
  const prefix = `/${locale}/categories/`;
  if (!pathname.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length).replace(/\/$/, "");
  return rest || "all";
}

function setJsonSearchParam(params, queryKey, obj) {
  if (!obj || typeof obj !== "object" || Object.keys(obj).length === 0) {
    params.delete(queryKey);
  } else {
    params.set(queryKey, JSON.stringify(obj));
  }
}

function parseJsonParam(searchParams, queryKey) {
  try {
    const raw = searchParams.get(queryKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useFiltersController({ categories, characteristicsMeta, filters, labels, locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [accordionState, setAccordionState] = useState({});

  const routeCategoryPath = useMemo(
    () => parseCategoriesPathFromPathname(pathname, locale),
    [pathname, locale],
  );

  const categorySidebarRoots = useMemo(() => {
    const tree = categories?.items ?? [];
    if (!Array.isArray(tree) || tree.length === 0) return [];
    if (!routeCategoryPath || routeCategoryPath === "all") return sortCategoriesBySort(tree);

    const current = findCategoryByFullSlug(tree, routeCategoryPath);
    const next = current?.children;
    return sortCategoriesBySort(Array.isArray(next) ? next : []);
  }, [categories?.items, routeCategoryPath]);

  const categoriesSectionTitle = useMemo(() => {
    const onCatalogAll = !routeCategoryPath || routeCategoryPath === "all";
    if (!onCatalogAll) return labels.subcategories ?? labels.categories ?? "";

    const fromFacets = filters?.facets?.categories?.meta?.title ?? filters?.categories?.meta?.title;
    const localized = pickLocalizedField(fromFacets, locale);
    return localized && String(localized).trim() ? localized : labels.categories ?? "";
  }, [
    filters?.categories?.meta?.title,
    filters?.facets?.categories?.meta?.title,
    labels.categories,
    labels.subcategories,
    locale,
    routeCategoryPath,
  ]);

  useEffect(() => {
    if (routeCategoryPath && routeCategoryPath !== "all") {
      setAccordionState((prev) => ({ ...prev, categories: true }));
    }
  }, [routeCategoryPath]);

  const isSectionOpen = useCallback((id) => accordionState[id] ?? true, [accordionState]);

  const toggleSection = useCallback((id) => {
    setAccordionState((prev) => ({ ...prev, [id]: !(prev?.[id] ?? true) }));
  }, []);

  const getCharObject = useCallback(
    () => parseJsonParam(searchParams, QUERY_CHAR),
    [searchParams],
  );

  const getOfferCharObject = useCallback(
    () => parseJsonParam(searchParams, QUERY_OFFER_CHAR),
    [searchParams],
  );

  const getOptObject = useCallback(
    () => parseJsonParam(searchParams, QUERY_OPT),
    [searchParams],
  );

  const commitFilterUrl = useCallback(
    (nextChar, nextOfferChar, nextOpt) => {
      const params = new URLSearchParams(searchParams.toString());
      setJsonSearchParam(params, QUERY_CHAR, nextChar);
      setJsonSearchParam(params, QUERY_OFFER_CHAR, nextOfferChar);
      setJsonSearchParam(params, QUERY_OPT, nextOpt);
      params.delete(QUERY_PAGE);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleClearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    [
      QUERY_CHAR,
      QUERY_OFFER_CHAR,
      QUERY_OPT,
      QUERY_PRICE_MIN,
      QUERY_PRICE_MAX,
      QUERY_CATEGORY_IDS,
      QUERY_ONLY_AVAILABLE,
      QUERY_PAGE,
    ].forEach((queryKey) => params.delete(queryKey));

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return {
    categoriesSectionTitle,
    categorySidebarRoots,
    charSnapshot: getCharObject(),
    commitFilterUrl,
    handleClearAllFilters,
    isSectionOpen,
    metaItemsPrepared: prepareFilterableMetaItems(characteristicsMeta),
    offerSnapshot: getOfferCharObject(),
    routeCategoryPath,
    toggleSection,
    getOptObject,
  };
}

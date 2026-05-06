"use client";

import PriceRange from "@features/priceRange";
import ActiveFilterTags from "./ActiveFilterTags";
import CategoryTree from "./CategoryTree";
import MetaFilterSections from "./MetaFilterSections";
import { useFiltersController } from "../model/useFiltersController";

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      xmlns="https://www.svgrepo.com/show/96618/arrow-pointing-right.svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0.664551 5.33789L5.16455 1.33789L9.66455 5.33789" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function Filters({
  handleCloseFilters,
  locale,
  filters,
  categories,
  characteristicsMeta,
  totalCount,
  labels,
  showInlineActiveTags = false,
}) {
  const {
    categoriesSectionTitle,
    categorySidebarRoots,
    charSnapshot,
    commitFilterUrl,
    handleClearAllFilters,
    isSectionOpen,
    metaItemsPrepared,
    offerSnapshot,
    routeCategoryPath,
    toggleSection,
    getOptObject,
  } = useFiltersController({ categories, characteristicsMeta, filters, labels, locale });

  const showResultsCount = Number(totalCount);
  const showResultsCountLabel = Number.isFinite(showResultsCount) ? showResultsCount : 0;

  return (
    <div className="filters" onClick={handleCloseFilters}>
      <div className="filters__card" onClick={(e) => e.stopPropagation()}>
        <div className="filters__modal-header">
          <p className="filters__modal-title">{labels.modalTitle}</p>
          <button
            type="button"
            className="filters__button-close"
            onClick={handleCloseFilters}
            aria-label={labels.closeModal}
          >
            <svg xmlns="https://img.icons8.com/carbon_copy/1200/close-window.jpg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M1 1L12 12M12 1L1 12" stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {showInlineActiveTags ? (
          <div className="filters__active-tags">
            <ActiveFilterTags
              variant="modal"
              filters={filters}
              characteristicsMeta={characteristicsMeta}
              locale={locale}
              priceLabel={labels.price}
              panelLabel={labels.selectedHeading}
              clearLabel={labels.clearActiveFilters}
              removeFilterAriaLabel={labels.removeFilterAria}
            />
          </div>
        ) : null}

        <div className="filters__groups">
          {categorySidebarRoots.length > 0 && (
            <div
              className={`filters__accordion ${
                isSectionOpen("categories") ? "filters__accordion--open" : "filters__accordion--closed"
              }`}
            >
              <button
                type="button"
                className="filters__accordion-header"
                onClick={() => toggleSection("categories")}
                aria-expanded={isSectionOpen("categories")}
              >
                <span className="filters__title">{categoriesSectionTitle}</span>
                <ChevronIcon className="filters__accordion-chevron" />
              </button>

              <div className="filters__accordion-panel">
                <div className="filters__accordion-panel-inner filters__accordion-panel-inner--category-tree">
                  <CategoryTree
                    locale={locale}
                    roots={categorySidebarRoots}
                    filters={filters}
                    routeCategoryPath={routeCategoryPath}
                    sectionTitle={categoriesSectionTitle}
                    onNavigate={handleCloseFilters}
                  />
                </div>
              </div>
            </div>
          )}

          <MetaFilterSections
            items={metaItemsPrepared}
            locale={locale}
            filters={filters}
            charObj={charSnapshot}
            offerObj={offerSnapshot}
            isSectionOpen={isSectionOpen}
            toggleSection={toggleSection}
            onCommitCharOffer={(nextChar, nextOffer) => commitFilterUrl(nextChar, nextOffer, getOptObject())}
          />
        </div>

        {filters?.facets?.pricing && (
          <div className="filters__price">
            <div
              className={`filters__accordion ${
                isSectionOpen("price") ? "filters__accordion--open" : "filters__accordion--closed"
              }`}
            >
              <button
                type="button"
                className="filters__accordion-header"
                onClick={() => toggleSection("price")}
                aria-expanded={isSectionOpen("price")}
              >
                <span className="filters__title">{labels.price}</span>
                <ChevronIcon className="filters__accordion-chevron" />
              </button>

              <div className="filters__accordion-panel">
                <div className="filters__accordion-panel-inner">
                  <PriceRange
                    price={filters.facets.pricing}
                    currency={labels.currency}
                    priceMinAria={labels.priceMinAria}
                    priceMaxAria={labels.priceMaxAria}
                    onApply={handleCloseFilters}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {handleCloseFilters && (
          <div className="filters__footer">
            <button type="button" className="filters__footer-btn filters__footer-btn--secondary" onClick={handleClearAllFilters}>
              {labels.clearFiltersModal}
            </button>
            <button type="button" className="filters__footer-btn filters__footer-btn--primary" onClick={handleCloseFilters}>
              {labels.showResultsModal} ({showResultsCountLabel})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

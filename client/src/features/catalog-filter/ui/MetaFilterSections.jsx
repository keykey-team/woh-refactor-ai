"use client";

import { colorPresetValueToHex } from "@shared";

import {
  buildFacetPresetRows,
  countBooleanTrueInFacet,
  findFacetByMetaKey,
  normalizePresetRows,
  resolveFilterSectionTitle,
  shouldRenderMetaCharacteristicSection,
  shouldShowFacetOption,
} from "../lib/characteristicsMetaHelpers";
import {
  isFacetMultiSelectType,
  toggleSelectionInRecord,
} from "../lib/filterFacetHelpers";

function isMetaColorCharacteristic(item) {
  const k = String(item?.key ?? "").toLowerCase();
  return k === "color" || k === "colour";
}

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0.664551 5.33789L5.16455 1.33789L9.66455 5.33789"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function isMetaValueActive(item, charObj, offerObj, technicalValue) {
  const key = item.key;
  const obj = item.scope === "group" ? charObj : offerObj;
  const val = obj[key];

  if (item.type === "boolean") {
    return val === true;
  }

  const tv = String(technicalValue);
  if (
    item.type === "select" ||
    item.type === "multiselect" ||
    item.type === "number" ||
    item.type === "string"
  ) {
    if (Array.isArray(val)) {
      return val.map(String).includes(tv);
    }
    return val !== undefined && String(val) === tv;
  }

  if (Array.isArray(val)) {
    return val.map(String).includes(tv);
  }
  return String(val ?? "") === tv;
}

export default function MetaFilterSections({
  items,
  locale,
  filters,
  charObj,
  offerObj,
  isSectionOpen,
  toggleSection,
  onCommitCharOffer,
}) {
  return (
    <>
      {items.map((item) => {
        if (!shouldRenderMetaCharacteristicSection(item, locale)) {
          return null;
        }

        const sectionId = `meta:${item.scope}:${item.key}`;
        const facet = findFacetByMetaKey(
          filters,
          item.scope,
          item.key,
        );
        const title = resolveFilterSectionTitle(
          item,
          locale,
          facet,
        );

        if (item.type === "boolean") {
          const checked = isMetaValueActive(
            item,
            charObj,
            offerObj,
            true,
          );
          const trueCount = facet
            ? countBooleanTrueInFacet(facet, item.scope)
            : 0;
          if (
            facet &&
            !shouldShowFacetOption(trueCount, checked)
          ) {
            return null;
          }
          return (
            <div
              key={item._id ?? sectionId}
              className={`filters__accordion ${
                isSectionOpen(sectionId)
                  ? "filters__accordion--open"
                  : "filters__accordion--closed"
              }`}
            >
              <button
                type="button"
                className="filters__accordion-header"
                onClick={() => toggleSection(sectionId)}
                aria-expanded={isSectionOpen(sectionId)}
              >
                <span className="filters__title">{title}</span>
                <ChevronIcon className="filters__accordion-chevron" />
              </button>
              <div className="filters__accordion-panel">
                <div className="filters__accordion-panel-inner">
                  <ul className="filters__list">
                    <li className="filters__item">
                      <label className="filters-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const nextChar = { ...charObj };
                            const nextOffer = { ...offerObj };
                            const target =
                              item.scope === "group"
                                ? nextChar
                                : nextOffer;
                            if (e.target.checked) {
                              target[item.key] = true;
                            } else {
                              delete target[item.key];
                            }
                            onCommitCharOffer(nextChar, nextOffer);
                          }}
                        />
                        <span className="filters-check__box" />
                        <span className="filters-check__text">
                          {facet
                            ? `${title} (${trueCount})`
                            : title}
                        </span>
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          );
        }

        const presets = facet
          ? buildFacetPresetRows(
              item,
              locale,
              facet,
              item.scope,
            )
          : normalizePresetRows(item, locale).map((row) => ({
              ...row,
              count: 0,
            }));
        const listClass = "filters__list";
        const useColorSwatches = isMetaColorCharacteristic(item);
        const useRadioAppearance =
          !useColorSwatches &&
          item.type !== "boolean" &&
          !isFacetMultiSelectType(item.type);

        return (
          <div
            key={item._id ?? sectionId}
            className={`filters__accordion ${
              isSectionOpen(sectionId)
                ? "filters__accordion--open"
                : "filters__accordion--closed"
            }`}
          >
            <button
              type="button"
              className="filters__accordion-header"
              onClick={() => toggleSection(sectionId)}
              aria-expanded={isSectionOpen(sectionId)}
            >
              <span className="filters__title">{title}</span>
              <ChevronIcon className="filters__accordion-chevron" />
            </button>

            <div className="filters__accordion-panel">
              <div className="filters__accordion-panel-inner">
                <ul
                  className={
                    useColorSwatches
                      ? "filters__color-grid"
                      : listClass
                  }
                >
                  {presets.map((row, idx) => {
                    const checked = isMetaValueActive(
                      item,
                      charObj,
                      offerObj,
                      row.value,
                    );
                    if (
                      facet &&
                      !shouldShowFacetOption(
                        row.count,
                        checked,
                      )
                    ) {
                      return null;
                    }

                    const labelText = facet
                      ? `${row.label} (${row.count})`
                      : row.label;

                    const onToggle = (e) => {
                      const nextChar = { ...charObj };
                      const nextOffer = { ...offerObj };
                      const target =
                        item.scope === "group"
                          ? nextChar
                          : nextOffer;
                      const key = item.key;

                      if (
                        item.type === "select" ||
                        item.type === "multiselect" ||
                        item.type === "number" ||
                        item.type === "string"
                      ) {
                        toggleSelectionInRecord(
                          target,
                          key,
                          row.value,
                          e.target.checked,
                        );
                      }

                      onCommitCharOffer(nextChar, nextOffer);
                    };

                    const rowKey = `${row.value}-${idx}`;

                    if (useColorSwatches) {
                      const hex =
                        colorPresetValueToHex(row.value);
                      const isWhite =
                        String(row.value)
                          .toLowerCase()
                          .trim() === "white";

                      return (
                        <li
                          key={rowKey}
                          className="filters__color-grid-item"
                        >
                          <label className="filters__color-row">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={onToggle}
                              aria-label={labelText}
                            />
                            <span
                              className={`filters__color-swatch${isWhite ? " filters__color-swatch--white" : ""}`}
                              style={
                                hex
                                  ? { backgroundColor: hex }
                                  : {
                                      backgroundColor: "#bdbdbd",
                                    }
                              }
                              aria-hidden
                            />
                            <span className="filters__color-label">
                              {labelText}
                            </span>
                          </label>
                        </li>
                      );
                    }

                    return (
                      <li key={rowKey} className="filters__item">
                        <label
                          className={
                            useRadioAppearance
                              ? "filters-check filters-check--radio-look"
                              : "filters-check"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={onToggle}
                          />
                          <span className="filters-check__box" />
                          <span className="filters-check__text">
                            {labelText}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

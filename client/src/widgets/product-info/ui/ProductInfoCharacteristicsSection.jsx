"use client";

import {
  formatCharacteristicLabel,
  formatCharacteristicValue,
} from "../lib/formatCharacteristics";

export default function ProductInfoCharacteristicsSection({
  specRows,
  locale,
  isOpen,
  onToggle,
}) {
  return (
    <div
      className={`pdp-info__accordion ${isOpen ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="pdp-info__accordion-head"
        aria-expanded={isOpen}
        aria-controls="pdp-acc-spec-table-panel"
        id="pdp-acc-spec-table-trigger"
        onClick={onToggle}
      >
        <span>ТАБЛИЦЯ ХАРАКТЕРИСТИК</span>
        <span className="pdp-info__accordion-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
            <path d="M0.664062 5.33789L5.16406 1.33789L9.66406 5.33789" stroke="#0D0D0D" strokeWidth="2" />
          </svg>
        </span>
      </button>
      <div
        id="pdp-acc-spec-table-panel"
        className="pdp-info__accordion-panel"
        role="region"
        aria-labelledby="pdp-acc-spec-table-trigger"
        aria-hidden={!isOpen}
      >
        <div className="pdp-info__accordion-panel-inner">
          <div className="pdp-info__accordion-body">
            {specRows.length ? (
              <table className="pdp-info__spec-table">
                <tbody>
                  {specRows.map((row, idx) => {
                    const label = formatCharacteristicLabel(row, locale);
                    const valueText = formatCharacteristicValue(row, locale);
                    if (!label && !valueText) return null;
                    return (
                      <tr key={row?.key ?? idx}>
                        <th scope="row">{label || row?.key}</th>
                        <td>{valueText || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="pdp-info__text-muted">
                Характеристики не надані.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

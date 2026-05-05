"use client"
import { BREAKPOINTS } from "@shared/config/BREAKPOINTS";
import { useRouter } from "next/navigation";
import React, { useEffect,useState } from "react";
import { useTranslation } from "react-i18next";
import Select, { components } from "react-select";

const DropdownChevron = (props) => (
  <components.DropdownIndicator {...props}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8.59961 0.799805L4.59961 3.7998L0.599609 0.799805"
        stroke="#0D0D0D"
        strokeWidth="2"
      />
    </svg>
  </components.DropdownIndicator>
);

export default function AutoCompleteSelect({
  isProduct = false,
  id,
  label,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  options,
  error,
  touched,
  routeBase = "/product",
  routeCategory,
  onSelectOption,
  placeholder,
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  
  const [menuTarget, setMenuTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMenuTarget(document.body);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINTS.mobileMax}px)`);
    const update = () => setIsMobile(Boolean(mq.matches));
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    // Safari fallback
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const handleChange = (selectedOption) => {
    if (isProduct) {
      if (selectedOption && selectedOption.value) {
        router.push(`${routeBase}/${routeCategory}/${selectedOption.value}`);
      }
      return;
    }

    if (onSelectOption) {
      onSelectOption(selectedOption);
    } else {
      onChange({
        target: {
          name,
          value: selectedOption ? selectedOption.value : "",
        },
      });
    }
  };

  const selectedOption = options?.find((opt) => opt.value === value) 
    || (value ? { value: value, label: value } : null);

  const finalPlaceholder = placeholder || (isProduct ? label : t("choose"));
  const controlFontSize = isMobile ? "14px" : "16px";

  return (
    <div className="custom-select-wrapper">
      <label htmlFor={id} className="custom-select-label">
        {label}
      </label>
      <Select
        instanceId={id} 
        inputId={id}
        name={name}
        className="select-new-post"
        classNamePrefix="react-select"
        options={options}
        value={selectedOption}
        onChange={handleChange}
        onBlur={!isProduct ? onBlur : undefined}
        isDisabled={disabled}
        placeholder={finalPlaceholder}
        menuPortalTarget={menuTarget}
        components={{
          IndicatorSeparator: null,
          DropdownIndicator: DropdownChevron,
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            borderRadius: "0px",
            background: "rgba(254, 254, 254, 0.70)",
            backdropFilter: "blur(4px)",
            height:"53px",
            borderColor: state.isFocused ? "#FF99D6" : "rgba(0, 0, 0, 0.1)",
            boxShadow: state.isFocused ? "0 0 0 1px #FF99D6" : "none",
            "&:hover": { 
              borderColor: "#FF99D6",
              background: "rgba(254, 254, 254, 0.85)" 
            },
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0 0 0 16px",
          }),
          indicatorsContainer: (base) => ({
            ...base,
            padding: "0 12px 0 0",
          }),
          indicatorSeparator: () => ({ display: "none" }),
          singleValue: (base) => ({
            ...base,
            color: "var(--Dark, #0D0D0D)",
            fontFamily: "\"Golos Text\"",
            fontSize: controlFontSize,
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }),
          input: (base) => ({
            ...base,
            color: "var(--Dark, #0D0D0D)",
            fontFamily: "\"Golos Text\"",
            fontSize: controlFontSize,
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }),
          placeholder: (base) => ({
            ...base,
            color: "#999", 
            fontSize: controlFontSize,
          }),
          menuPortal: (base) => ({ 
            ...base, 
            zIndex: 9999 
          }),
          menu: (base) => ({
            ...base,
            borderRadius: "0px",
            background: "rgba(254, 254, 254, 0.95)", 
            backdropFilter: "blur(10px)",
            overflow: "hidden",
            marginTop: "8px", 
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }),
          menuList: (base) => ({
            ...base,
            padding: 0,
            borderRadius: "0px",
          }),
          option: (base, state) => ({
            ...base,
            borderRadius: "0px", 
            padding: "0 16px",
            margin: "2px 0",
            fontSize: controlFontSize,
            backgroundColor: state.isSelected 
              ? "#FF99D6" 
              : state.isFocused 
                ? "rgba(255, 153, 214, 0.1)" 
                : "transparent",
            color: state.isSelected ? "white" : "#333",
            cursor: "pointer",
            "&:active": {
              backgroundColor: "#FF99D6",
              color: "white"
            }
          }),
        }}
        filterOption={(option, inputValue) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
      />
      {!isProduct && error && touched && <div className="error">{error}</div>}
    </div>
  );
}
import React, { useState, useRef, useEffect, useMemo } from 'react';

const CustomSelect = ({
    options,
    value,
    onChange,
    placeholder,
    error,
    touched,
    onBlur,
    name,
    id,
    isDisabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const selectRef = useRef(null);
    const hasError = Boolean(touched && error);

    const selectedOption = useMemo(() => 
        options.find(opt => opt.value === value), 
    [options, value]);

    // Синхронізуємо текст в інпуті з вибраним значенням при ініціалізації або зміні ззовні
    useEffect(() => {
        if (selectedOption) {
            setInputValue(selectedOption.label);
        } else {
            setInputValue('');
        }
    }, [selectedOption]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                setInputValue(selectedOption ? selectedOption.label : '');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedOption]);

    const filteredOptions = useMemo(() => {
        // Якщо інпут порожній або текст збігається з вибраним — показуємо все
        if (!inputValue || (selectedOption && inputValue === selectedOption.label)) {
            return options;
        }
        return options.filter(option => 
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    }, [options, inputValue, selectedOption]);

    const handleInputChange = (e) => {
        if (isDisabled) return;
        setInputValue(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const handleOptionClick = (option) => {
        if (isDisabled) return;
        onChange(option.value);
        setInputValue(option.label);
        setIsOpen(false);
    };

    return (
        <div ref={selectRef} className={`custom-select-wrapper ${isOpen ? 'is-open' : ''} ${hasError ? 'has-error' : ''} ${isDisabled ? 'is-disabled' : ''}`}>
            <div className="custom-select-trigger-input-wrapper">
                <input
                    id={id}
                    name={name}
                    type="text"
                    className={`custom-select-input ${hasError ? 'error' : ''}`}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => !isDisabled && setIsOpen(true)}
                    onBlur={onBlur}
                    disabled={isDisabled}
                />
                <svg 
                    className={`custom-select-icon ${isOpen ? 'rotated' : ''}`}
                    width="12" height="12" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2"
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {isOpen && (
                <div className="custom-select-dropdown">
                    <div className="custom-select-options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="custom-select-no-results">Нічого не знайдено</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
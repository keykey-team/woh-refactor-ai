import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const CustomSelect = ({options}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Варианты лимитов
    const defaultOptions = [10, 20, 50, 100];
    const optionsToUse = options || defaultOptions;
    
    // Получаем текущее значение из URL
    const currentLimit = searchParams.get('limit') || optionsToUse[0];

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('limit', value);
        setSearchParams(newParams);
        setIsOpen(false);
    };

    return (
        <div className="custom-select" ref={dropdownRef}>
            <div 
                className={`custom-select__trigger ${isOpen ? 'open' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{currentLimit} на сторінці</span>
                <svg className="arrow-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            {isOpen && (
                <ul className="custom-select__options">
                    {options.map((option) => (
                        <li 
                            key={option} 
                            className={`custom-select__option ${currentLimit === String(option) ? 'selected' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option} на сторінці
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
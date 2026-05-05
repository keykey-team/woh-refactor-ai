"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductForm } from '../lib/useProductForm';
import CustomSelect from '../../../shared/ui/select-form/CustomSelect';
import CustomInput from '../../../shared/ui/input-form/CustomInput';
import { generateSlug } from '../lib/generateSlug';
import CatalogPagination from '../../pagination/ui/Pagination'; 
// Імпортуємо функції для роботи з API
import { getAdminCategoriesTree } from '../../../shared/api/categories.services'; 
import { uploadAdminImages } from '../../../shared/api/products.services'; 
import toast from '../../../shared/lib/toast';

const ProductForm = ({ type, initialData, variationsData }) => {
    const formik = useProductForm(type, initialData, variationsData);
    const [searchParams, setSearchParams] = useSearchParams();

    const isEditMode = type !== 'create';

    // === БАЗОВИЙ URL ДЛЯ КАРТИНОК ===
    const API_BASE_URL = process.env.REACT_APP_API_URL_IMG?.trim() || process.env.REACT_APP_API_URL_IMG?.trim() || '';

    // Функція, яка підклеює домен до відносного шляху (якщо це ще не зроблено)
    const getFullImageUrl = (imgUrl) => {
        if (!imgUrl) return '';
        if (imgUrl.startsWith('http')) return imgUrl;
        return `${API_BASE_URL}${imgUrl}`;
    };

    // === СТЕЙТ ДЛЯ КАТЕГОРІЙ ===
    const [categoryOptions, setCategoryOptions] = useState([]);

    // === ЗАВАНТАЖЕННЯ ТА ФОРМАТУВАННЯ КАТЕГОРІЙ ===
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const treeData = await getAdminCategoriesTree();
                
                const categoriesArray = treeData?.items || treeData?.data || (Array.isArray(treeData) ? treeData : []);
                
                const formattedOptions = categoriesArray.map((cat) => ({
                    value: String(cat._id || cat.id),
                    label: cat.title?.ua || cat.name?.ua || cat.title || 'Без назви'
                }));

                setCategoryOptions(formattedOptions);
            } catch (error) {
                console.error("Помилка завантаження категорій:", error);
            }
        };

        fetchCategories();
    }, []);

    const axes = formik.values.variationAxes || [];
    const offers = formik.values.offers || [];

    // === ЛОГІКА ЧИТАННЯ ПОТОЧНИХ ФІЛЬТРІВ З URL ===
    const currentOpt = useMemo(() => {
        if (!isEditMode) return {};
        try {
            return JSON.parse(searchParams.get('opt') || '{}');
        } catch {
            return {};
        }
    }, [searchParams, isEditMode]);

    // === ЛОГІКА ОНОВЛЕННЯ ФІЛЬТРІВ ===
    const handleFilterChange = (axisId, value) => {
        const newOpt = { ...currentOpt };

        if (value) {
            newOpt[axisId] = value;
        } else {
            delete newOpt[axisId]; 
        }

        const newParams = new URLSearchParams(searchParams.toString());
        
        if (Object.keys(newOpt).length > 0) {
            newParams.set('opt', JSON.stringify(newOpt));
        } else {
            newParams.delete('opt');
        }
        
        newParams.set('page', '1'); 
        setSearchParams(newParams);
    };

    useEffect(() => {
        const titleUa = formik.values.title?.ua;

        if (titleUa) {
            const newSlug = generateSlug(titleUa);
            formik.setFieldValue('slug', newSlug);
        } else if (!titleUa && !initialData?.slug) {
            formik.setFieldValue('slug', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.title?.ua]);

    const handleAddAxis = () => {
        const nextNum = axes.length > 0
            ? Math.max(...axes.map(a => parseInt(a.axisId.replace('A', '')) || 0)) + 1
            : 1;

        const newAxis = {
            axisId: `A${nextNum}`,
            title: { ua: '', en: '' },
            type: 'select',
            valuesPreset: []
        };
        formik.setFieldValue('variationAxes', [...axes, newAxis]);
    };

    const handleRemoveAxis = (indexToRemove) => {
        const newAxes = axes.filter((_, i) => i !== indexToRemove);
        formik.setFieldValue('variationAxes', newAxes);
    };

    const handleAddOffer = () => {
        const newOffer = {
            title: '', price: '', sku: '', options: {}, image: null
        };
        formik.setFieldValue('offers', [...offers, newOffer]);
    };

    const handleRemoveOffer = (indexToRemove) => {
        const newOffers = offers.filter((_, i) => i !== indexToRemove);
        formik.setFieldValue('offers', newOffers);
    };

    const getAxisPresetLabel = (preset) => {
        if (preset && typeof preset === 'object') {
            if (typeof preset.label === 'string') return preset.label;
            if (preset.label?.ua) return preset.label.ua;
            if (preset.label?.en) return preset.label.en;
            if (typeof preset.value !== 'undefined') return String(preset.value);
        }
        return String(preset ?? '');
    };

    const getAxisPresetValue = (preset) => {
        if (preset && typeof preset === 'object' && typeof preset.value !== 'undefined') {
            return String(preset.value);
        }
        return String(preset ?? '');
    };

    const parseAxisPresetFromInput = (rawValue, axisIndex) => {
        const tokens = rawValue.split(',').map((s) => s.trim()).filter(Boolean);
        const prevValues = formik.values.variationAxes?.[axisIndex]?.valuesPreset || [];
        const isObjectPreset = prevValues.some((item) => item && typeof item === 'object');

        if (!isObjectPreset) return tokens;

        return tokens.map((token) => {
            const matched = prevValues.find((item) => {
                if (!item || typeof item !== 'object') return false;
                const label = getAxisPresetLabel(item).toLowerCase();
                const value = getAxisPresetValue(item).toLowerCase();
                const query = token.toLowerCase();
                return label === query || value === query;
            });

            if (matched) return matched;

            return {
                value: token,
                label: { ua: token, en: token }
            };
        });
    };

    return (
        <>
        <form id="product-create-form" onSubmit={formik.handleSubmit} className="product-form">
            <h1>Дані товару</h1>

            {/* === ОСНОВНА ІНФОРМАЦІЯ ПРО ТОВАР === */}
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="title.ua" name="title.ua" label="Назва товару (UA)"
                    value={formik.values.title?.ua || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Введіть назву українською" error={formik.errors.title?.ua} touched={formik.touched.title?.ua}
                />
                <CustomInput
                    id="title.en" name="title.en" label="Назва товару (EN)"
                    value={formik.values.title?.en || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Enter title in English" error={formik.errors.title?.en} touched={formik.touched.title?.en}
                />
            </div>

            <div className="form-wrapper-2-1-column">
                <CustomInput
                    id="slug" name="slug" label="Slug (URL товару)"
                    value={formik.values.slug || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="generyetsya-avtomatichno" error={formik.errors.slug} touched={formik.touched.slug}
                />
                <div className="form-group">
                    <label htmlFor="category">Категорія</label>
                    <div className="input-wrapper">
                        <CustomSelect
                            options={categoryOptions} 
                            value={formik.values.category}
                            onChange={(value) => formik.setFieldValue('category', value)} 
                            onBlur={formik.handleBlur}
                            name="category"
                            id="category"
                            error={formik.errors.category}
                            touched={formik.touched.category}
                            placeholder={categoryOptions.length > 0 ? "Виберіть категорію" : "Завантаження..."}
                        />
                    </div>
                    {formik.touched.category && formik.errors.category ? (
                        <div className="error-text">{formik.errors.category}</div>
                    ) : null}
                </div>
            </div>

            <div className="form-wrapper-2-column">
                <CustomInput
                    id="subtitle.ua" name="subtitle.ua" label="Підпис до товару (UA)"
                    value={formik.values.subtitle?.ua || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Короткий підпис українською..." error={formik.errors.subtitle?.ua} touched={formik.touched.subtitle?.ua}
                />
                <CustomInput
                    id="subtitle.en" name="subtitle.en" label="Підпис до товару (EN)"
                    value={formik.values.subtitle?.en || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    placeholder="Short subtitle in English..." error={formik.errors.subtitle?.en} touched={formik.touched.subtitle?.en}
                />
            </div>

            {/* === ОПИС ТОВАРУ === */}
            <div className="form-group">
                <label htmlFor="description.ua">Опис товару (UA)</label>
                <textarea
                    id="description.ua"
                    name="description.ua"
                    className={`custom-textarea ${formik.touched.description?.ua && formik.errors.description?.ua ? 'error' : ''}`}
                    value={formik.values.description?.ua || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Детальний опис українською..."
                />
                {formik.touched.description?.ua && formik.errors.description?.ua && (
                    <div className="error-text">{formik.errors.description.ua}</div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="description.en">Опис товару (EN)</label>
                <textarea
                    id="description.en"
                    name="description.en"
                    className={`custom-textarea ${formik.touched.description?.en && formik.errors.description?.en ? 'error' : ''}`}
                    value={formik.values.description?.en || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Detailed description in English..."
                />
                {formik.touched.description?.en && formik.errors.description?.en && (
                    <div className="error-text">{formik.errors.description.en}</div>
                )}
            </div>

            {/* === НАЛАШТУВАННЯ ОСЕЙ === */}
            <h1 className="product-form__section-title">Осі варіацій (Налаштування)</h1>
            <div className="product__axes">
                {axes.map((axis, i) => (
                    <div key={axis.axisId || i} className="product__axes-item">
                        <div className="product__axes-header">
                            <strong>Вісь: {axis.axisId}</strong>
                            <button
                                type="button"
                                onClick={() => handleRemoveAxis(i)}
                                className="btn-remove"
                            >
                                - Видалити вісь
                            </button>
                        </div>

                        <div className="form-wrapper-2-column">
                            <CustomInput
                                id={`axes-${i}-title-ua`}
                                name={`variationAxes[${i}].title.ua`}
                                label="Назва осі (UA)"
                                value={formik.values.variationAxes[i]?.title?.ua || ''}
                                onChange={formik.handleChange}
                                placeholder="Напр. Смак, Розмір..."
                            />
                        </div>

                        {/* Тип осі */}
                        <div className="form-wrapper-2-column" style={{ marginTop: '10px' }}>
                            <div className="form-group">
                                <label>Тип осі</label>
                                <div className="input-wrapper">
                                    <CustomSelect
                                        options={[
                                            { value: 'select', label: 'select (з перекладами)' },
                                            { value: 'number', label: 'number (числа)' },
                                        ]}
                                        value={formik.values.variationAxes[i]?.type || 'select'}
                                        onChange={(val) => formik.setFieldValue(`variationAxes[${i}].type`, val)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Значення осі */}
                        <div className="product__axes-values">
                            <label className="product__axes-values-title">Доступні значення</label>

                            {(() => {
                                const preset = formik.values.variationAxes[i]?.valuesPreset || [];
                                const axisType = formik.values.variationAxes[i]?.type;
                                const isObjectPreset = axisType === 'select' || preset.some(item => item && typeof item === 'object');

                                if (isObjectPreset) {
                                    return (
                                        <>
                                            {preset.map((item, vi) => (
                                                <div key={vi} className="product__axes-value-row">
                                                    <CustomInput
                                                        id={`axes-${i}-val-${vi}-value`}
                                                        label="value"
                                                        value={item?.value ?? ''}
                                                        onChange={(e) => {
                                                            const updated = [...preset];
                                                            updated[vi] = { ...updated[vi], value: e.target.value };
                                                            formik.setFieldValue(`variationAxes[${i}].valuesPreset`, updated);
                                                        }}
                                                        placeholder="straight"
                                                    />
                                                    <CustomInput
                                                        id={`axes-${i}-val-${vi}-ua`}
                                                        label="Назва (UA)"
                                                        value={item?.label?.ua ?? ''}
                                                        onChange={(e) => {
                                                            const updated = [...preset];
                                                            updated[vi] = { ...updated[vi], label: { ...(updated[vi]?.label || {}), ua: e.target.value } };
                                                            formik.setFieldValue(`variationAxes[${i}].valuesPreset`, updated);
                                                        }}
                                                        placeholder="Прямий"
                                                    />
                                                    <CustomInput
                                                        id={`axes-${i}-val-${vi}-en`}
                                                        label="Назва (EN)"
                                                        value={item?.label?.en ?? ''}
                                                        onChange={(e) => {
                                                            const updated = [...preset];
                                                            updated[vi] = { ...updated[vi], label: { ...(updated[vi]?.label || {}), en: e.target.value } };
                                                            formik.setFieldValue(`variationAxes[${i}].valuesPreset`, updated);
                                                        }}
                                                        placeholder="Straight"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-remove"
                                                        onClick={() => {
                                                            const updated = preset.filter((_, idx) => idx !== vi);
                                                            formik.setFieldValue(`variationAxes[${i}].valuesPreset`, updated);
                                                        }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className="btn-add-secondary"
                                                onClick={() => {
                                                    const updated = [...preset, { value: '', label: { ua: '', en: '' } }];
                                                    formik.setFieldValue(`variationAxes[${i}].valuesPreset`, updated);
                                                }}
                                            >
                                                + Додати значення
                                            </button>
                                        </>
                                    );
                                }

                                return (
                                    <CustomInput
                                        id={`axes-${i}-values`}
                                        label="Значення (через кому)"
                                        value={preset.join(', ')}
                                        onChange={(e) => {
                                            const valArray = e.target.value.split(',');
                                            formik.setFieldValue(`variationAxes[${i}].valuesPreset`, valArray);
                                        }}
                                        onBlur={(e) => {
                                            const valArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            formik.setFieldValue(`variationAxes[${i}].valuesPreset`, valArray);
                                            formik.handleBlur(e);
                                        }}
                                        placeholder="23, 23.5, 24, 24.5"
                                    />
                                );
                            })()}
                        </div>
                    </div>
                ))}

                <button type="button" onClick={handleAddAxis} className="btn-add-secondary">
                    + Додати вісь
                </button>
            </div>

            {/* === ВАРІАЦІЇ ТОВАРУ (ОФФЕРИ) === */}
            <div className="product__variations-header">
                <h1>Варіації товару (Оффери)</h1>
            </div>

            {/* === БЛОК ФІЛЬТРАЦІЇ ОФФЕРІВ ПО ОСЯМ === */}
            {isEditMode && axes.length > 0 && (
                <div className="offers-filters" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {axes.map((axis) => {
                        const filterOptions = [
                            { value: '', label: 'Всі' },
                            ...(axis.valuesPreset?.map(val => ({
                                value: getAxisPresetValue(val),
                                label: getAxisPresetLabel(val)
                            })) || [])
                        ];

                        return (
                            <div key={`filter-${axis.axisId}`} className="form-group" style={{ minWidth: '200px' }}>
                                <label>Фільтр: {axis.title?.ua || axis.axisId}</label>
                                <CustomSelect
                                    options={filterOptions}
                                    value={currentOpt[axis.axisId] || ''}
                                    onChange={(val) => handleFilterChange(axis.axisId, val)}
                                    placeholder="Оберіть значення"
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="product__variations">
                {offers.map((item, index) => (
                    <div className="product__variation" key={index}>

                        <div className="product__variation__header">
                            <div className="product__variation__title-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.02745 0.0858936C1.37383 0.0388511 1.87187 0 2.57447 0C3.27706 0 3.77511 0.0388511 4.12149 0.0858936C4.70426 0.165468 5.07755 0.62934 5.11266 1.18168C5.13279 1.49694 5.14894 1.94536 5.14894 2.57447C5.14894 3.20357 5.13279 3.652 5.11266 3.96726C5.07755 4.5196 4.70426 4.98347 4.12126 5.06304C3.77511 5.11009 3.2773 5.14894 2.57447 5.14894C1.87164 5.14894 1.37383 5.11009 1.02745 5.06304C0.444681 4.98347 0.071617 4.51936 0.0365106 3.96702C0.0161489 3.652 0 3.20357 0 2.57447C0 1.94536 0.0161489 1.49694 0.0362766 1.18168C0.071383 0.62934 0.444681 0.165468 1.02745 0.0858936ZM1.02745 10.9141C1.37383 10.9611 1.87164 11 2.57447 11C3.2773 11 3.77511 10.9611 4.12149 10.9141C4.70426 10.8345 5.07755 10.3707 5.11266 9.81832C5.13279 9.50306 5.14894 9.05464 5.14894 8.42553C5.14894 7.79643 5.13279 7.348 5.11266 7.03274C5.07755 6.4804 4.70426 6.01653 4.12126 5.93696C3.77511 5.88991 3.2773 5.85106 2.57447 5.85106C1.87164 5.85106 1.37383 5.88991 1.02745 5.93696C0.444681 6.01653 0.071617 6.48064 0.0365106 7.03298C0.0161489 7.348 0 7.79643 0 8.42553C0 9.05464 0.0161489 9.50306 0.0362766 9.81832C0.071383 10.3707 0.444681 10.8345 1.02745 10.9141ZM11 8.42553C11 9.12836 10.9611 9.62617 10.9141 9.97255C10.8345 10.5553 10.3707 10.9286 9.81832 10.9637C9.50306 10.9839 9.05464 11 8.42553 11C7.79643 11 7.348 10.9839 7.03274 10.9637C6.4804 10.9286 6.01653 10.5551 5.93696 9.97232C5.88991 9.62617 5.85106 9.12836 5.85106 8.42553C5.85106 7.7227 5.88991 7.22489 5.93696 6.87851C6.01653 6.29574 6.4804 5.92245 7.03274 5.88734C7.348 5.86721 7.79643 5.85106 8.42553 5.85106C9.05464 5.85106 9.50306 5.86721 9.81832 5.88734C10.3707 5.92245 10.8345 6.29574 10.9141 6.87875C10.9611 7.22489 11 7.7227 11 8.42553ZM7.91228 0.323915C8.13415 -0.0816809 8.71692 -0.0816809 8.93879 0.323915L9.405 1.1763C9.50165 1.35303 9.64697 1.49835 9.8237 1.595L10.6761 2.06121C11.0817 2.28309 11.0817 2.86585 10.6761 3.08772L9.8237 3.55394C9.64697 3.65059 9.50165 3.7959 9.405 3.97264L8.93879 4.82502C8.71692 5.23062 8.13415 5.23062 7.91228 4.82502L7.44606 3.97264C7.34941 3.7959 7.2041 3.65059 7.02736 3.55394L6.17498 3.08772C5.76938 2.86585 5.76938 2.28309 6.17498 2.06121L7.02736 1.595C7.2041 1.49835 7.34941 1.35303 7.44606 1.1763L7.91228 0.323915Z" fill="#0F172A" />
                                </svg>
                                <h3>{item.title || `Нова варіація ${index + 1}`}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveOffer(index)}
                                className="btn-remove"
                            >
                                - Видалити оффер
                            </button>
                        </div>

                        <div className="product__variation__content">
                          <div className="variation-image-upload">
                            <label className="variation-image-upload__label">Зображення</label>
                            <div 
                                className="variation-image-upload__box" 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    position: 'relative',
                                    padding: '15px',
                                    textAlign: 'center',
                                    border: '1px dashed #ccc',
                                    borderRadius: '8px'
                                }}
                            >
                                {formik.values.offers?.[index]?.image && typeof formik.values.offers[index].image === 'string' ? (
                                    <>
                                        <img 
                                            src={getFullImageUrl(formik.values.offers[index].image)} 
                                            alt="Preview" 
                                            style={{ 
                                                width: '100%', 
                                                maxHeight: '120px', 
                                                objectFit: 'contain', 
                                                borderRadius: '4px', 
                                                marginBottom: '8px' 
                                            }} 
                                        />
                                        <span className="variation-image-upload__text" style={{ color: '#7864F5', fontWeight: '500' }}>
                                            Змінити
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ marginBottom: '8px' }}>
                                            <path d="M39.1111 4.88889V39.1111H4.88889V4.88889H39.1111ZM39.1111 0H4.88889C2.2 0 0 2.2 0 4.88889V39.1111C0 41.8 2.2 44 4.88889 44H39.1111C41.8 44 44 41.8 44 39.1111V4.88889C44 2.2 41.8 0 39.1111 0ZM27.2311 21.6578L19.8978 31.1178L14.6667 24.7867L7.33333 34.2222H36.6667L27.2311 21.6578Z" fill="#7864F5"/>
                                        </svg>
                                        <span className="variation-image-upload__text" style={{ color: '#7864F5', fontWeight: '500' }}>
                                            Завантажити
                                        </span>
                                    </>
                                )}
                                
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml, image/avif, image/tiff, image/bmp"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                    onChange={async (e) => {
                                        const file = e.currentTarget.files[0];
                                        if (!file) return;

                                        try {
                                            const response = await uploadAdminImages(file);

                                            if (response?.ok && response?.data?.length > 0) {
                                                const imageUrl = response.data[0].url; 
                                                const fullImageUrl = getFullImageUrl(imageUrl);
                                                formik.setFieldValue(`offers[${index}].image`, fullImageUrl);
                                            }
                                        } catch (error) {
                                            console.error("Upload error:", error);
                                            toast.error("Помилка при завантаженні зображення");
                                        }
                                    }}
                                    className="variation-image-upload__input"
                                />
                            </div>
                        </div>

                            <div className="variation-details">
                                <div className="form-wrapper-3-column">
                                    <CustomInput
                                        id={`offers-${index}-price`} name={`offers[${index}].price`}
                                        label="Ціна" type="number"
                                        value={formik.values.offers?.[index]?.price || ''} onChange={formik.handleChange}
                                        placeholder="0.00"
                                    />
                                    <CustomInput
                                        id={`offers-${index}-sku`} name={`offers[${index}].sku`}
                                        label="Артикул (SKU)"
                                        value={formik.values.offers?.[index]?.sku || ''} onChange={formik.handleChange}
                                        placeholder="Введіть артикул"
                                    />
                                </div>

                                <div className="form-wrapper-2-column">
                                    {axes.map((axis) => {
                                        const selectOptions = axis.valuesPreset?.map(val => ({
                                            value: getAxisPresetValue(val),
                                            label: getAxisPresetLabel(val)
                                        })) || [];

                                        return (
                                            <div className="form-group" key={axis.axisId}>
                                                <label>{axis.title?.ua || axis.axisId}</label>
                                                <CustomSelect
                                                    options={selectOptions}
                                                    value={String(formik.values.offers?.[index]?.options?.[axis.axisId] || '')}
                                                    onChange={(val) => formik.setFieldValue(`offers[${index}].options.${axis.axisId}`, val)}
                                                    placeholder="Оберіть опцію"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button type="button" onClick={handleAddOffer} className="btn-add-primary">
                    + Додати варіацію
                </button>
            </div>

            {/* === ПАГІНАЦІЯ ОФФЕРІВ === */}
            {isEditMode && variationsData?.meta && variationsData.meta.total > 0 && (
                <CatalogPagination data={variationsData.meta} />
            )}

        </form>
        </>
    );
};

export default ProductForm;
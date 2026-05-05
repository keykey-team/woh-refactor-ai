"use client";
import React, { useEffect } from 'react';
import { useCategoryForm } from '../lib/useCategoryForm';
import CustomSelect from '../../../shared/ui/select-form/CustomSelect';
import CustomInput from '../../../shared/ui/input-form/CustomInput';
import { generateSlug } from '../lib/generateSlug';
import { getStatusOptions } from '../../../shared/lib/statuses';

const STATUS_OPTIONS = getStatusOptions(['active', 'hidden', 'draft'], { labelType: 'form' });

const CategoryForm = ({ type, initialData }) => {
    const formik = useCategoryForm(type, initialData);

    useEffect(() => {
        const titleUa = formik.values.title?.ua;

        if (titleUa && !initialData?.slug) {
            const newSlug = generateSlug(titleUa);
            formik.setFieldValue('slug', newSlug);
        } else if (!titleUa && !initialData?.slug) {
            formik.setFieldValue('slug', '');
        }
       
    }, [formik.values.title?.ua]);

  
    const handleNestedChange = (field) => (e) => {
        const value = e?.target !== undefined ? e.target.value : e;
        formik.setFieldValue(field, value);
    };

    return (
        <form id="category-create-form" onSubmit={formik.handleSubmit} className="product-form">
            <h1>Дані категорії</h1>

            {/* === НАЗВА === */}
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="title.ua" name="title.ua" label="Назва категорії (UA)"
                    value={formik.values.title?.ua || ''} 
                    onChange={handleNestedChange('title.ua')} 
                    onBlur={formik.handleBlur}
                    placeholder="Введіть назву українською" error={formik.errors.title?.ua} touched={formik.touched.title?.ua}
                />
                <CustomInput
                    id="title.en" name="title.en" label="Назва категорії (EN)"
                    value={formik.values.title?.en || ''} 
                    onChange={handleNestedChange('title.en')} 
                    onBlur={formik.handleBlur}
                    placeholder="Enter category title" error={formik.errors.title?.en} touched={formik.touched.title?.en}
                />
            </div>

            {/* === SLUG ТА СТАТУС === */}
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="slug" name="slug" label="Slug (URL категорії)"
                    value={formik.values.slug || ''} 
                    onChange={formik.handleChange} 
                    onBlur={formik.handleBlur}
                    placeholder="generyetsya-avtomatichno" error={formik.errors.slug} touched={formik.touched.slug}
                />
                
                <div className="form-group">
                    <label htmlFor="status">Статус</label>
                    <div className="input-wrapper">
                        <CustomSelect
                            options={STATUS_OPTIONS} 
                            value={formik.values.status}
                            onChange={(value) => formik.setFieldValue('status', value)} 
                            onBlur={formik.handleBlur}
                            name="status"
                            id="status"
                            error={formik.errors.status}
                            touched={formik.touched.status}
                            placeholder="Виберіть статус"
                        />
                    </div>
                </div>
            </div>

            {/* === ОПИС === */}
            <CustomInput
                id="description.ua" name="description.ua" label="Опис категорії (UA)"
                value={formik.values.description?.ua || ''} 
                onChange={handleNestedChange('description.ua')} 
                onBlur={formik.handleBlur}
                placeholder="Опис українською..." error={formik.errors.description?.ua} touched={formik.touched.description?.ua}
            />
            <CustomInput
                id="description.en" name="description.en" label="Опис категорії (EN)"
                value={formik.values.description?.en || ''} 
                onChange={handleNestedChange('description.en')} 
                onBlur={formik.handleBlur}
                placeholder="Description in English..." error={formik.errors.description?.en} touched={formik.touched.description?.en}
            />

        </form>
    );
};

export default CategoryForm;
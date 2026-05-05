"use client";
import React, { useEffect, useState } from 'react';
import { useArticleForm } from '../lib/useArticleForm';
import CustomSelect from '../../../shared/ui/select-form/CustomSelect';
import CustomInput from '../../../shared/ui/input-form/CustomInput';
import { generateSlug } from '../lib/generateSlug';
import { uploadAdminImages } from '../../../shared/api/products.services';
import { getStatusLabel } from '../../../shared/lib/statuses';
import toast from '../../../shared/lib/toast';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Отримуємо базовий URL для відображення картинок
const BASE_IMG_URL = 'http://localhost:5007';

const PUBLISH_OPTIONS = [
    { value: 'true', label: getStatusLabel('published') },
    { value: 'false', label: 'Приховано' },
];

const quillModules = {
    toolbar: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
    ],
};

const ArticleForm = ({ type, initialData }) => {
    const formik = useArticleForm(type, initialData);
    const [isUploading, setIsUploading] = useState(false);

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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const data = await uploadAdminImages(file);

            const uploadedItem = Array.isArray(data) ? data[0]?.url : data;

            console.log(uploadedItem.data?.[0]?.url)
            if (uploadedItem.data?.[0]?.url) {
                formik.setFieldValue('cover.url', uploadedItem.data?.[0]?.url);

                if (uploadedItem.preview || uploadedItem.data?.[0]?.preview) {
                    formik.setFieldValue('cover.preview', uploadedItem.preview || uploadedItem.data?.[0]?.preview);
                }
            } else {
                console.warn("URL не знайдено у відповіді сервера", data);
                toast.error("Файл завантажено, але бекенд не повернув URL");
            }
        } catch (error) {
            console.error("Помилка завантаження зображення", error);
            toast.error("Помилка при завантаженні зображення");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form id="article-create-form" onSubmit={formik.handleSubmit} className="product-form">
            
            {/* === 1. ОБКЛАДИНКА === */}
            <h2>Обкладинка статті</h2>
            <div className="form-wrapper-2-column align-items-start">
                <div className="form-group image-upload-group">
                    <label>Головне фото</label>
                    <div className="image-upload-container">
                        <label className={`image-dropzone ${isUploading ? 'uploading' : ''}`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                hidden
                            />
                            {isUploading ? (
                                <div className="upload-state">
                                    <span className="spinner">⌛</span> Завантаження...
                                </div>
                            ) : (
                                <div className="upload-state">
                                    <span className="icon">📁</span>
                                    <span className="text">Натисніть для вибору файлу</span>
                                </div>
                            )}
                        </label>

                        {/* Прев'ю картинки */}
                        {(formik.values.cover?.preview || formik.values.cover?.url) && (
                            <div className="image-preview-box">
                                <img
                                    src={
                                        (formik.values.cover.preview || formik.values.cover.url).startsWith('http')
                                            ? (formik.values.cover.preview || formik.values.cover.url)
                                            : `${BASE_IMG_URL}${(formik.values.cover.preview || formik.values.cover.url)}`
                                    }
                                    alt="Cover Preview"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="alt-group">
                    <CustomInput
                        id="cover.alt.ua" name="cover.alt.ua" label="Alt обкладинки (UA)"
                        value={formik.values.cover?.alt?.ua || ''}
                        onChange={handleNestedChange('cover.alt.ua')}
                    />
                    <CustomInput
                        id="cover.alt.en" name="cover.alt.en" label="Alt обкладинки (EN)"
                        value={formik.values.cover?.alt?.en || ''}
                        onChange={handleNestedChange('cover.alt.en')}
                    />
                </div>
            </div>

            <hr className="form-divider" />

            {/* === 2. ОСНОВНА ІНФОРМАЦІЯ (ТАЙТЛИ, СТАТУС, СЛАГ, ТЕГИ) === */}
            <h2>Основна інформація</h2>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="title.ua" name="title.ua" label="Заголовок (UA)"
                    value={formik.values.title?.ua || ''}
                    onChange={handleNestedChange('title.ua')}
                    onBlur={formik.handleBlur}
                    placeholder="Введіть заголовок" error={formik.errors.title?.ua} touched={formik.touched.title?.ua}
                />
                <CustomInput
                    id="title.en" name="title.en" label="Заголовок (EN)"
                    value={formik.values.title?.en || ''}
                    onChange={handleNestedChange('title.en')}
                    onBlur={formik.handleBlur}
                    placeholder="Enter title"
                />
            </div>

            <div className="form-wrapper-2-column">
                <CustomInput
                    id="slug" name="slug" label="Slug (URL статті)"
                    value={formik.values.slug || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="generyetsya-avtomatichno" error={formik.errors.slug} touched={formik.touched.slug}
                />
                <div className="form-group">
                    <label htmlFor="isPublished">Статус публікації</label>
                    <div className="input-wrapper">
                        <CustomSelect
                            options={PUBLISH_OPTIONS}
                            value={formik.values.isPublished}
                            onChange={(value) => formik.setFieldValue('isPublished', value)}
                            onBlur={formik.handleBlur}
                            name="isPublished"
                            id="isPublished"
                            error={formik.errors.isPublished}
                            touched={formik.touched.isPublished}
                            placeholder="Виберіть статус"
                        />
                    </div>
                </div>
            </div>

            <div className="form-wrapper-2-column">
                <CustomInput
                    id="tags" name="tags" label="Теги (через кому)"
                    value={formik.values.tags || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="догляд, взуття, high heels"
                />
            </div>

            <hr className="form-divider" />

            {/* === 3. ТІЛО СТАТТІ (КОРОТКИЙ ОПИС + WYSIWYG) === */}
            <h2>Текст статті</h2>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="excerpt.ua" name="excerpt.ua" label="Короткий опис (UA)"
                    value={formik.values.excerpt?.ua || ''}
                    onChange={handleNestedChange('excerpt.ua')}
                    onBlur={formik.handleBlur}
                />
                <CustomInput
                    id="excerpt.en" name="excerpt.en" label="Короткий опис (EN)"
                    value={formik.values.excerpt?.en || ''}
                    onChange={handleNestedChange('excerpt.en')}
                    onBlur={formik.handleBlur}
                />
            </div>

            <div className="form-wrapper-2-column">
                <div className="form-group quill-wrapper">
                    <label>Повний текст (UA)</label>
                    <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        value={formik.values.body?.ua || ''}
                        onChange={(content) => formik.setFieldValue('body.ua', content)}
                    />
                </div>
                <div className="form-group quill-wrapper">
                    <label>Повний текст (EN)</label>
                    <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        value={formik.values.body?.en || ''}
                        onChange={(content) => formik.setFieldValue('body.en', content)}
                    />
                </div>
            </div>

            <hr className="form-divider" />

            {/* === 4. SEO === */}
            <h2>SEO налаштування</h2>
            <div className="form-wrapper-2-column">
                <CustomInput
                    id="seo.title.ua" name="seo.title.ua" label="SEO Title (UA)"
                    value={formik.values.seo?.title?.ua || ''}
                    onChange={handleNestedChange('seo.title.ua')}
                />
                <CustomInput
                    id="seo.description.ua" name="seo.description.ua" label="SEO Description (UA)"
                    value={formik.values.seo?.description?.ua || ''}
                    onChange={handleNestedChange('seo.description.ua')}
                />
            </div>
        </form>
    );
};

export default ArticleForm;
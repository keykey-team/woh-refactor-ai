"use client"

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { createAdminCategory, updateAdminCategory } from '../../../shared/api/categories.services'; 
import toast from '../../../shared/lib/toast';

const formatPayload = (values) => ({
    title: {
        ua: values.title?.ua || "",
        en: values.title?.en || ""
    },
    slug: values.slug,
    parentId: values.parentId || null,
    status: values.status || "active",
    sort: Number(values.sort) || 0,
    description: {
        ua: values.description?.ua || "",
        en: values.description?.en || ""
    }
});

export const useCategoryForm = (type, initialData) => {
    const navigate = useNavigate();

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: {
                ua: initialData?.title?.ua || '',
                en: initialData?.title?.en || ''
            },
            slug: initialData?.slug || '',
            parentId: initialData?.parentId || '',
            status: initialData?.status || 'active',
            sort: initialData?.sort !== undefined ? initialData.sort : 10,
            description: {
                ua: initialData?.description?.ua || '',
                en: initialData?.description?.en || ''
            }
        },
        validationSchema: Yup.object({
            title: Yup.object({
                ua: Yup.string().min(2, 'Мінімум 2 символи').required("Обов'язкове поле (UA)"),
                en: Yup.string() 
            }),
            slug: Yup.string()
                .matches(/^[a-z0-9-]+$/, 'Слаг може містити лише маленькі латинські літери, цифри та дефіс')
                .required("Обов'язкове поле"),
            status: Yup.string().oneOf(['active', 'hidden', 'draft']).required("Обов'язкове поле"),
            sort: Yup.number().typeError('Має бути числом'),
          
            description: Yup.object({
                ua: Yup.string(),
                en: Yup.string()
            })
        }),
        onSubmit: async (values) => {
            try {
                const payload = formatPayload(values);
                
                if (type === 'create') {
                    const response = await createAdminCategory(payload);
                    if (response?.error) throw new Error(response.message || 'Помилка при створенні');
                    toast.success('Категорію успішно створено!');
                } else {
                    const categoryId = initialData?._id; 
                    const response = await updateAdminCategory(categoryId, payload);
                    if (response?.error) throw new Error(response.message || 'Помилка при оновленні');
                    toast.success('Категорію успішно оновлено!');
                }
                
                navigate('/categories'); 

            } catch (error) {
                console.error('Помилка при збереженні:', error);
                toast.error(error.message || 'Сталася помилка. Спробуйте ще раз.');
            }
        },
    });

    return formik;
};
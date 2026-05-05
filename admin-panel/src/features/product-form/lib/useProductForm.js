"use client"

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { createAdminCatalogGroup, updateAdminCatalogGroup } from '../../../shared/api/products.services';
import toast from '../../../shared/lib/toast';

// Оновлюємо formatPayload
const formatPayload = (values) => ({
    slug: values.slug,
    // Тепер сюди потрапляє реальний _id вибраної категорії з селекта
    categoryIds: [values.category], 
    status: "active",
    imageURL: values.imageURL || "https://i.postimg.cc/8k2LRmzP/fallback.webp", 
    title: values.title,
    subtitle: values.subtitle,
    description: values.description,
    variationAxes: values.variationAxes.map(axis => ({
        axisId: axis.axisId,
        title: {
            ua: axis.title?.ua || "",
            en: axis.title?.en || ""
        },
        type: axis.type || "select",
        unit: axis.unit || null,
        valuesPreset: axis.valuesPreset || []
    })),
    characteristics: [],
    offers: values.offers.map(offer => ({
        ...(offer._id && { _id: offer._id }), 
        sku: offer.sku,
        price: Number(offer.price),
        opt_price: null,
        available: true,
        img: typeof offer.image === 'string' ? offer.image : "https://i.postimg.cc/8k2LRmzP/fallback.webp",
        optionMap: offer.options || {},
        stocks: [
            {
                warehouseId: "69c470e7475b219c3e3255a0",
                onHand: 10,
                reserved: 0
            }
        ],
        characteristics: []
    }))
});

export const useProductForm = (type, initialData, variationsData) => {
    const navigate = useNavigate();

    const defaultAxes = variationsData?.variationAxes || [];

    const defaultOffers = variationsData?.items?.length
        ? variationsData.items.map(offer => ({
            _id: offer._id,
            title: offer.optionKey || '',
            price: offer.price || '',
            sku: offer.sku || '',
            options: offer.optionMap || {},
            image: offer.img || null,
        }))
        : [];

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            slug: initialData?.slug || '',
            title: {
                ua: initialData?.title?.ua || '',
                en: initialData?.title?.en || ''
            },
            subtitle: {
                ua: initialData?.subtitle?.ua || '',
                en: initialData?.subtitle?.en || ''
            },
            description: {
                ua: initialData?.description?.ua || '',
                en: initialData?.description?.en || ''
            },
            // Беремо першу категорію з масиву, якщо редагуємо існуючий товар
            category: initialData?.categoryIds?.[0] || '',
            variationAxes: defaultAxes,
            offers: defaultOffers,
        },
        validationSchema: Yup.object({
            slug: Yup.string()
                .matches(/^[a-z0-9-]+$/, 'Слаг може містити лише маленькі латинські літери, цифри та дефіс')
                .required("Обов'язкове поле"),
            title: Yup.object({
                ua: Yup.string().min(3, 'Мінімум 3 символи').required("Обов'язкове поле (UA)"),
                en: Yup.string().min(3, 'Мінімум 3 символи').required("Обов'язкове поле (EN)"),
            }),
            category: Yup.string().required('Виберіть категорію'),
            subtitle: Yup.object({
                ua: Yup.string().max(200, 'Не більше 200 символів').required("Обов'язкове поле (UA)"),
                en: Yup.string().max(200, 'Не більше 200 символів').required("Обов'язкове поле (EN)"),
            }),
            description: Yup.object({
                ua: Yup.string().max(1000, 'Не більше 1000 символів').required("Обов'язкове поле (UA)"),
                en: Yup.string().max(1000, 'Не більше 1000 символів').required("Обов'язкове поле (EN)"),
            }),
            offers: Yup.array().of(
                Yup.object().shape({
                    price: Yup.number()
                        .typeError('Ціна має бути числом')
                        .required("Обов'язкове поле"),
                    sku: Yup.string().required('Введіть артикул'),
                })
            )
        }),
        onSubmit: async (values) => {
            try {
                const payload = formatPayload(values);
                
                if (type === 'create') {
                    await createAdminCatalogGroup(payload);
                    toast.success('Товар успішно створено!');
                } else {
                    const groupId = initialData?._id;
                    await updateAdminCatalogGroup(groupId, payload);
                    toast.success('Товар успішно оновлено!');
                }
                
                navigate('/products');

            } catch (error) {
                console.error('Помилка при збереженні:', error);
                toast.error(error.message || 'Сталася помилка. Спробуйте ще раз.');
            }
           
        },
    });

    return formik;
};
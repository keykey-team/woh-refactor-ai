"use client"
import { getCartData } from "@entities/cart";
import { getWishlistData } from "@entities/wishlist";
import { loginUser } from '@shared/api/authServices';
import { MODALS } from '@shared/config/modals';
import { useI18n } from '@shared/i18n/use-i18n';
import { useModals } from '@shared/index';
import { normalizeUaPhoneDigits, toUaE164Phone } from '@shared/lib/uaPhone';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

export const useLoginForm = () => {
    const dispatch = useDispatch();
    const { t } = useI18n();
    const { isModalOpen, setIsModalOpen, isTxt, setIsTxt } = useModals();

    const formik = useFormik({
        initialValues: { phone: '', password: '', rememberMe: false },
        validationSchema: Yup.object({
            phone: Yup.string()
                .required(t('authorization.validation.required'))
                .test('ua-phone', t('authorization.validation.required'), (value) => {
                    const digits = normalizeUaPhoneDigits(value);
                    return digits.length === 12 && digits.startsWith('380');
                }),
            password: Yup.string()
                .required(t('authorization.validation.required')),
        }),
        onSubmit: async (values) => {
            try {
                formik.setStatus(undefined);
                await loginUser({
                    email: toUaE164Phone(values.phone),
                    password: values.password,
                    rememberMe: values.rememberMe,
                });

                await dispatch(getCartData()).unwrap();
                await dispatch(getWishlistData()).unwrap();
                setIsTxt({ title: t("txt-modal.login.title"), description: t("txt-modal.login.desc"), btn: t("txt-modal.login.btn") })
                setIsModalOpen(MODALS.TXTINFO)
            } catch (error) {
                const status = Number(error?.status);
                if (status === 401 || status === 403) {
                    formik.setStatus({
                        submitError: t("Auth.errors.invalidCredentials"),
                    });
                    return;
                }
                const message =
                    (typeof error?.message === "string" && error.message.trim()) ||
                    "Сталася помилка входу. Спробуйте ще раз.";
                formik.setStatus({ submitError: message });
            }
        },
    });

    return formik;
};
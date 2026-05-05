"use client";
import { formatUaPhone, MODALS, toUaE164Phone, useI18n, useModals, useToast } from "@shared";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from "yup";

import { useResetForm } from '../lib/useResetForm';

const ResetForm = () => {
    const { t } = useI18n();
    const toast = useToast();
    const { setIsModalOpen, setIsTxt } = useModals();
    const { requestSmsCode, verifySmsCode, submitNewPassword } = useResetForm();
    const [step, setStep] = useState("phone");
    const [codeError, setCodeError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [resetTokenIssuedAt, setResetTokenIssuedAt] = useState(0);
    const codeRef = useRef(null);
    const passwordRef = useRef(null);

    const validationSchema = useMemo(() => {
        const phoneSchema = Yup.string()
            .required(t("authorization.validation.required"))
            .test("ua-phone", t("authorization.validation.required"), (value) => {
                const digits = String(value || "").replace(/\D/g, "");
                return digits.length === 12 && digits.startsWith("380");
            });

        const codeSchema =
            step !== "code"
                ? Yup.string().notRequired()
                : Yup.string()
                    .required(t("authorization.validation.required"))
                    .matches(/^\d{4}$/, t("authorization.validation.required"));

        const passwordSchema =
            step !== "password"
                ? Yup.string().notRequired()
                : Yup.string()
                    .min(6, t("authorization.validation.minPassword"))
                    .required(t("authorization.validation.required"));

        const confirmPasswordSchema =
            step !== "password"
                ? Yup.string().notRequired()
                : Yup.string()
                    .oneOf([Yup.ref("password")], t("authorization.validation.passwordsMustMatch") || t("authorization.validation.required"))
                    .required(t("authorization.validation.required"));

        return Yup.object({
            phone: phoneSchema,
            code: codeSchema,
            password: passwordSchema,
            confirmPassword: confirmPasswordSchema,
        });
    }, [step, t]);

    const formik = useFormik({
        initialValues: { phone: "", code: "", password: "", confirmPassword: "" },
        validationSchema,
        validateOnMount: true,
        onSubmit: async (values) => {
            setCodeError("");
            setPasswordError("");

            if (step === "phone") {
                await requestSmsCode(toUaE164Phone(values.phone));
                setStep("code");
                return;
            }

            if (step === "code") {
                try {
                    const res = await verifySmsCode({
                        phone: toUaE164Phone(values.phone),
                        code: values.code,
                        purpose: "password_reset",
                    });

                    if (res?.isRegistered === false) {
                        const message =
                            t("authorization.phoneNotFound") ||
                            "Номер не знайдено. Перевірте телефон або зареєструйтесь.";
                        setCodeError(message);
                        toast.error(message);
                        return;
                    }

                    const recoveryToken = String(res?.resetToken || "");
                    if (res?.isRegistered === true && recoveryToken) {
                        setResetToken(recoveryToken);
                        setResetTokenIssuedAt(Date.now());
                        setStep("password");
                        return;
                    }

                    if (!recoveryToken) {
                        setCodeError(t("authorization.resetTokenMissing") || "Не вдалося отримати токен для скидання паролю. Спробуйте ще раз.");
                        return;
                    }

                    setResetToken(recoveryToken);
                    setResetTokenIssuedAt(Date.now());
                    setStep("password");
                    return;
                } catch (err) {
                    const status = Number(err?.status);
                    if (status === 401) {
                        setCodeError(err?.message || t("authorization.invalidCode") || "Невірний код.");
                        return;
                    }
                    setCodeError(err?.message || "Не вдалося підтвердити код.");
                    return;
                }
            }

            if (step === "password") {
                try {
                    if (!resetToken) {
                        setPasswordError(
                            t("authorization.recoveryTokenExpired") ||
                            "Термін дії посилання вичерпано або токен недійсний. Спробуйте ще раз.",
                        );
                        setStep("phone");
                        return;
                    }
                    if (resetTokenIssuedAt && Date.now() - resetTokenIssuedAt > 5 * 60 * 1000) {
                        setPasswordError(
                            t("authorization.recoveryTokenExpired") ||
                            "Термін дії посилання вичерпано або токен недійсний. Спробуйте ще раз.",
                        );
                        setResetToken("");
                        setResetTokenIssuedAt(0);
                        setStep("phone");
                        return;
                    }

                    await submitNewPassword({ resetToken, password: values.password });
                    setIsTxt({
                        title: t("txt-modal.reset.title"),
                        description: t("txt-modal.reset.desc"),
                        btn: t("txt-modal.reset.btn"),
                    });
                    setIsModalOpen(MODALS.TXTINFO);
                    return;
                } catch (err) {
                    const status = Number(err?.status);
                    if (status === 400) {
                        setPasswordError(
                            t("authorization.recoveryTokenExpired") ||
                            "Термін дії посилання вичерпано або токен недійсний. Спробуйте ще раз.",
                        );
                        setResetToken("");
                        setResetTokenIssuedAt(0);
                        setStep("phone");
                        return;
                    }
                    setPasswordError(err?.message || t("authorization.resetPasswordError") || "Не вдалося змінити пароль. Спробуйте ще раз.");
                    return;
                }
            }
        },
    });

    useEffect(() => {
        if (step === "code") {
            window.setTimeout(() => codeRef.current?.focus?.(), 0);
        }
        if (step === "password") {
            window.setTimeout(() => passwordRef.current?.focus?.(), 0);
        }
    }, [step]);

    const isValidCode = /^\d{4}$/.test(String(formik.values.code || ""));

    return (
        <form onSubmit={formik.handleSubmit} className="auth-form">
            <div className="form-group">
                <label htmlFor="phone">{t('authorization.phoneLabel')}</label>
                <div className="auth-input-wrap">
                    <span className="auth-input-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        className="auth-input"
                        placeholder={t("authorization.phonePlaceholder")}
                        disabled={step !== "phone"}
                        value={formatUaPhone(formik.values.phone)}
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                            const next = formatUaPhone(e.target.value);
                            formik.setFieldValue("phone", next, true);
                        }}
                    />
                </div>
                {formik.touched.phone && formik.errors.phone ? <div className="error-text">{formik.errors.phone}</div> : null}
            </div>

            {step === "code" && (
                <div className="form-group">
                    <label htmlFor="code">{t("authorization.smsCodeLabel")}</label>
                    <div className="auth-input-wrap">
                        <input
                            id="code"
                            name="code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            ref={codeRef}
                            onChange={(e) => {
                                setCodeError("");
                                formik.handleChange(e);
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.code}
                            className="auth-input"
                            placeholder={t("authorization.smsCodePlaceholder")}
                        />
                    </div>
                    {codeError ? <div className="error-text">{codeError}</div> : null}
                    {formik.touched.code && formik.errors.code ? <div className="error-text">{formik.errors.code}</div> : null}
                </div>
            )}

            {step === "password" && (
                <>
                    <div className="form-group">
                        <label htmlFor="password">{t("authorization.newPasswordLabel") || "Новий пароль"}</label>
                        <div className="auth-input-wrap">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                ref={passwordRef}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className="auth-input"
                                placeholder={t("authorization.newPasswordPlaceholder") || "Введіть новий пароль"}
                            />
                        </div>
                        {formik.touched.password && formik.errors.password ? <div className="error-text">{formik.errors.password}</div> : null}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">{t("authorization.confirmPasswordLabel") || "Повторіть пароль"}</label>
                        <div className="auth-input-wrap">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                                className="auth-input"
                                placeholder={t("authorization.confirmPasswordPlaceholder") || "Повторіть новий пароль"}
                            />
                        </div>
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? <div className="error-text">{formik.errors.confirmPassword}</div> : null}
                    </div>

                    {passwordError ? <div className="error-text" role="alert">{passwordError}</div> : null}
                </>
            )}

            <button
                className='auth-submit'
                type="submit"
                disabled={
                    !formik.isValid ||
                    formik.isSubmitting ||
                    (step === "phone" && !formik.values.phone) ||
                    (step === "code" && !isValidCode) ||
                    (step === "password" && (!formik.values.password || !formik.values.confirmPassword))
                }
            >
                {step === "phone"
                    ? t("authorization.sendCodeBtn")
                    : step === "code"
                        ? t("authorization.restoreBtn")
                        : t("authorization.savePasswordBtn") || "Зберегти пароль"}
            </button>
        </form>
    );
};

export default ResetForm;

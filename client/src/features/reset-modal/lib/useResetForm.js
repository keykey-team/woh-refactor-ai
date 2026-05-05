"use client"
import { requestPhoneAuthCode, resetPassword, useI18n, verifyPhoneAuthCode } from "@shared";

export const useResetForm = () => {
    const { t } = useI18n();

    const requestSmsCode = async (phone) => {
        return await requestPhoneAuthCode({ phone });
    };

    const verifySmsCode = async ({ phone, code, purpose }) => {
        try {
            return await verifyPhoneAuthCode({ phone, code, purpose, rememberMe: false, persistAuth: false });
        } catch (err) {
            const status = Number(err?.status);
            if (status === 401) {
                const attemptsRemaining =
                    err?.data?.details?.attemptsRemaining ??
                    err?.data?.details?.attempts_remaining ??
                    null;

                const message =
                    typeof attemptsRemaining === "number"
                        ? t("authorization.invalidSmsCode", { count: attemptsRemaining })
                        : t("authorization.invalidCode") || "Невірний код.";

                const next = new Error(message);
                next.status = err?.status;
                next.data = err?.data;
                throw next;
            }
            throw err;
        }
    };

    const submitNewPassword = async ({ resetToken, password }) => {
        return await resetPassword({ resetToken, password });
    };

    return { requestSmsCode, verifySmsCode, submitNewPassword };
};

"use client";
import { StarCounter } from "@features/stars";
import { useI18n, useModals } from "@shared";
import React from 'react';

import { useWriteReviewForm } from '../lib/useWriteReviewForm';

function getLocalizedProductTitle(product, locale) {
  return (
    product?.title?.[locale] ??
    product?.title?.ua ??
    product?.title?.uk ??
    product?.title?.en ??
    product?.title ??
    ""
  );
}

const WriteReviewModal = ({ product, locale }) => {
  const { t } = useI18n();
  const { isModalOpen, setIsModalOpen } = useModals();
  const [isSent, setIsSent] = React.useState(false);
  const modalRef = React.useRef(null);
  const nameInputRef = React.useRef(null);
  const successCloseBtnRef = React.useRef(null);
  const previouslyFocusedElRef = React.useRef(null);
  const isOpen = isModalOpen === "write-review";

  const groupId = product?.offers?.[0]?.groupId;

  const formik = useWriteReviewForm(groupId, {
    onSuccess: () => {
      setIsSent(true);
      if (groupId != null && String(groupId).trim() !== "") {
        window.dispatchEvent(
          new CustomEvent("product-reviews-refetch", {
            detail: { groupId: String(groupId).trim() },
          }),
        );
      }
    },
  });

  const {
    values,
    setFieldValue,
    touched,
    errors,
    handleSubmit,
    isSubmitting,
    status,
  } = formik;

  const restoreFocus = () => {
    const el = previouslyFocusedElRef.current;
    if (el && typeof el.focus === "function" && document.contains(el)) {
      requestAnimationFrame(() => el.focus());
    }
  };

  const closeModal = () => {
    setIsModalOpen(null);
    setIsSent(false);
    restoreFocus();
  };

  const getFocusableElements = (container) => {
    if (!container) return [];
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(container.querySelectorAll(selectors.join(",")))
      .filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
      return;
    }

    if (e.key !== "Tab") return;

    const focusables = getFocusableElements(modalRef.current);
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !modalRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElRef.current = document.activeElement;
    return () => restoreFocus();
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    if (isSent) {
      requestAnimationFrame(() => {
        successCloseBtnRef.current?.focus?.();
      });
      return;
    }

    requestAnimationFrame(() => {
      nameInputRef.current?.focus?.();
    });
  }, [isOpen, isSent]);

  if (!isOpen) return null;

  return (
    <div className="write-review-overlay" onClick={closeModal}>
      <aside
        className={`write-review-modal${isSent ? " write-review-modal--sent" : ""}`}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby={isSent ? "write-review-sent-title" : "write-review-modal-title"}
        role="dialog"
        aria-modal="true"
        ref={modalRef}
        onKeyDown={handleKeyDown}
      >
        {isSent ? (
          <>
            <button
              type="button"
              className="write-review-modal__close write-review-modal__close--sent"
              onClick={closeModal}
              ref={successCloseBtnRef}
              aria-label={t("common.close")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.59648 0.260661C1.42135 0.0915142 1.18679 -0.00208057 0.943324 3.51024e-05C0.699855 0.00215078 0.466958 0.0998076 0.294793 0.271972C0.122629 0.444137 0.0249717 0.677034 0.022856 0.920503C0.0207403 1.16397 0.114335 1.39853 0.283482 1.57366L5.19841 6.48859L0.283482 11.4035C0.194794 11.4892 0.124053 11.5916 0.0753877 11.7049C0.0267222 11.8182 0.00110646 11.9401 3.50598e-05 12.0634C-0.00103634 12.1867 0.0224581 12.3089 0.0691475 12.423C0.115837 12.5372 0.184786 12.6408 0.271972 12.728C0.359158 12.8152 0.462835 12.8842 0.576953 12.9309C0.691071 12.9775 0.813345 13.001 0.93664 13C1.05994 12.9989 1.18178 12.9733 1.29507 12.9246C1.40836 12.8759 1.51082 12.8052 1.59648 12.7165L6.51141 7.80159L11.4263 12.7165C11.6015 12.8857 11.836 12.9793 12.0795 12.9771C12.323 12.975 12.5559 12.8774 12.728 12.7052C12.9002 12.533 12.9978 12.3001 13 12.0567C13.0021 11.8132 12.9085 11.5786 12.7393 11.4035L7.82441 6.48859L12.7393 1.57366C12.9085 1.39853 13.0021 1.16397 13 0.920503C12.9978 0.677034 12.9002 0.444137 12.728 0.271972C12.5559 0.0998076 12.323 0.00215078 12.0795 3.51024e-05C11.836 -0.00208057 11.6015 0.0915142 11.4263 0.260661L6.51141 5.17559L1.59648 0.260661Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="write-review-success" role="status" aria-live="polite">
              <p className="write-review-success__title" id="write-review-sent-title">
                {t("reviews.sentTitle")}
              </p>
              <p className="write-review-success__text">
                {t("reviews.sentText")}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="write-review-modal__header">
              <div className="write-review-modal__heading">
                <h2 className="write-review-modal__title" id="write-review-modal-title">
                  {getLocalizedProductTitle(product, locale)}
                </h2>
                <p className="write-review-modal__subtitle">
                  {t("reviews.modalSubtitle")}
                </p>
              </div>

              <button
                type="button"
                className="write-review-modal__close"
                onClick={closeModal}
                aria-label={t('common.close')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.59648 0.260661C1.42135 0.0915142 1.18679 -0.00208057 0.943324 3.51024e-05C0.699855 0.00215078 0.466958 0.0998076 0.294793 0.271972C0.122629 0.444137 0.0249717 0.677034 0.022856 0.920503C0.0207403 1.16397 0.114335 1.39853 0.283482 1.57366L5.19841 6.48859L0.283482 11.4035C0.194794 11.4892 0.124053 11.5916 0.0753877 11.7049C0.0267222 11.8182 0.00110646 11.9401 3.50598e-05 12.0634C-0.00103634 12.1867 0.0224581 12.3089 0.0691475 12.423C0.115837 12.5372 0.184786 12.6408 0.271972 12.728C0.359158 12.8152 0.462835 12.8842 0.576953 12.9309C0.691071 12.9775 0.813345 13.001 0.93664 13C1.05994 12.9989 1.18178 12.9733 1.29507 12.9246C1.40836 12.8759 1.51082 12.8052 1.59648 12.7165L6.51141 7.80159L11.4263 12.7165C11.6015 12.8857 11.836 12.9793 12.0795 12.9771C12.323 12.975 12.5559 12.8774 12.728 12.7052C12.9002 12.533 12.9978 12.3001 13 12.0567C13.0021 11.8132 12.9085 11.5786 12.7393 11.4035L7.82441 6.48859L12.7393 1.57366C12.9085 1.39853 13.0021 1.16397 13 0.920503C12.9978 0.677034 12.9002 0.444137 12.728 0.271972C12.5559 0.0998076 12.323 0.00215078 12.0795 3.51024e-05C11.836 -0.00208057 11.6015 0.0915142 11.4263 0.260661L6.51141 5.17559L1.59648 0.260661Z"
                    fill="#0D0D0D"
                  />
                </svg>
              </button>
            </div>

            <form className="write-review-form" onSubmit={handleSubmit}>

              <div className="write-review-form__field">
                <label htmlFor="name" className="write-review-form__label">
                  {t('reviews.nameLabel')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`write-review-form__input ${touched.name && errors.name ? 'error' : ''}`}
                  placeholder={t('reviews.namePlaceholder')}
                  {...formik.getFieldProps('name')}
                  ref={nameInputRef}
                />
                {touched.name && errors.name && (
                  <div className="error-text">{errors.name}</div>
                )}
              </div>

              <div className="write-review-form__field">
                <label htmlFor="text" className="write-review-form__label">
                  {t('reviews.textLabel')}
                </label>
                <textarea
                  id="text"
                  name="text"
                  className={`write-review-form__textarea ${touched.text && errors.text ? 'error' : ''}`}
                  placeholder={t('reviews.textPlaceholder')}
                  rows={1}
                  {...formik.getFieldProps('text')}
                />
                {touched.text && errors.text && (
                  <div className="error-text">{errors.text}</div>
                )}
              </div>

              <div className="write-review-form__rating">
                <p className="write-review-form__rating-title write-review-form__rating-title--accent">
                  {t('reviews.ratingTitle')}
                </p>
                <div className="write-review-form__stars">
                  <StarCounter
                    rating={values.rating}
                    onSelect={(val) => setFieldValue("rating", val)}
                  />
                </div>
                {touched.rating && errors.rating && (
                  <div className="error-text">{errors.rating}</div>
                )}
              </div>

              {status ? (
                <div className="error-text" role="alert">
                  {status}
                </div>
              ) : null}

              <button
                type="submit"
                className="submit-review-button"
                disabled={isSubmitting}
              >
                {t('reviews.submitBtn')}
              </button>
            </form>
          </>
        )}
      </aside>
    </div>
  );
};

export default WriteReviewModal;

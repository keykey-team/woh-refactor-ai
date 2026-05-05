"use client";

import {
  formatUaPhone,
  normalizeUaPhoneDigits,
  PageHeader,
  useI18n,
} from "@shared";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_SOURCES = [
  { value: "ads", label: "Реклама" },
  { value: "coach_reco", label: "Рекомендація тренера" },
  { value: "friend_reco", label: "Рекомендація подруги" },
  { value: "self_found", label: "Знайшли самостійно" },
];

export default function ContactsPage() {
  const params = useParams();
  const locale = params?.locale ?? "ua";
  const { t } = useI18n();

  const title = t?.("navigation.header.contacts") ?? "Контакти";

  const breadcrumbsLabels = useMemo(() => ({
    home: t("breadcrumbs.home"),
    page: t("breadcrumbs.page"),
  }), [t]);

  const breadcrumbsItems = useMemo(() => ([
    { label: title },
  ]), [title]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    source: "",
    message: "",
  });

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onPhoneChange = (e) => {
    const next = formatUaPhone(e.target.value);
    setForm((prev) => ({ ...prev, phone: next }));
  };

  const sourceLabel = useMemo(() => (
    DEFAULT_SOURCES.find((o) => o.value === form.source)?.label ?? ""
  ), [form.source]);

  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isSourceFieldHidden, setIsSourceFieldHidden] = useState(false);
  const sourceRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1249.98px)");
    const sync = () => setIsSourceFieldHidden(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isSourceFieldHidden) setIsSourceOpen(false);
  }, [isSourceFieldHidden]);

  useEffect(() => {
    if (!isSourceOpen) return;
    const onDocMouseDown = (e) => {
      if (!sourceRef.current) return;
      if (!sourceRef.current.contains(e.target)) {
        setIsSourceOpen(false);
      }
    };
    const onDocKeyDown = (e) => {
      if (e.key === "Escape") setIsSourceOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [isSourceOpen]);

  const onPickSource = (value) => {
    setForm((prev) => ({ ...prev, source: value }));
    setIsSourceOpen(false);
  };

  const isFormValid = useMemo(() => {
    const nameOk = form.name.trim().length > 0;
    const phoneDigits = normalizeUaPhoneDigits(form.phone);
    const phoneOk =
      phoneDigits.length === 12 && phoneDigits.startsWith("380");
    const sourceOk = isSourceFieldHidden || form.source.trim().length > 0;
    const messageOk = form.message.trim().length > 0;
    return nameOk && phoneOk && sourceOk && messageOk;
  }, [form, isSourceFieldHidden]);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="contacts-page">
      <PageHeader
        locale={locale}
        breadcrumbsLabels={breadcrumbsLabels}
        breadcrumbsItems={breadcrumbsItems}
        title={title}
      />

      <div className="container">
        <div className="contacts-page__grid">
          <section className="contacts-page__card contacts-page__card--form">
            <h2 className="contacts-page__card-title">
              Надіслати запит
            </h2>

            <form className="contacts-form" onSubmit={onSubmit}>
              <div className="contacts-form__field contacts-form__field--floating">
                <input
                  id="contacts-name"
                  className="contacts-form__input"
                  type="text"
                  value={form.name}
                  onChange={onChange("name")}
                  placeholder=" "
                />
                <label className="contacts-form__label" htmlFor="contacts-name">
                  Ваше ім&apos;я
                </label>
              </div>

              <div className="contacts-form__field contacts-form__field--floating">
                <input
                  id="contacts-phone"
                  className="contacts-form__input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formatUaPhone(form.phone)}
                  onChange={onPhoneChange}
                  placeholder=" "
                />
                <label className="contacts-form__label" htmlFor="contacts-phone">
                  Телефон
                </label>
              </div>

              <div className="contacts-form__field contacts-form__field--source">
                <div className="contacts-form__dropdown" ref={sourceRef}>
                  <select
                    id="contacts-source"
                    className="contacts-form__select contacts-form__select--sr"
                    value={form.source}
                    onChange={onChange("source")}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <option value="" disabled>
                      Оберіть варіант
                    </option>
                    {DEFAULT_SOURCES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="contacts-form__select contacts-form__select--custom"
                    aria-haspopup="listbox"
                    aria-expanded={isSourceOpen}
                    onClick={() => setIsSourceOpen((v) => !v)}
                  >
                    {sourceLabel || "Звідки ви про нас дізналися?"}
                    <span className="contacts-form__select-icon" aria-hidden="true" />
                  </button>

                  {isSourceOpen && (
                    <ul className="contacts-form__options" role="listbox" aria-label="Джерело">
                      {DEFAULT_SOURCES.map((o) => (
                        <li key={o.value} role="option" aria-selected={form.source === o.value}>
                          <button
                            type="button"
                            className="contacts-form__option"
                            onClick={() => onPickSource(o.value)}
                          >
                            {o.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="contacts-form__field">
                <textarea
                  id="contacts-message"
                  className="contacts-form__textarea"
                  rows={2}
                  value={form.message}
                  onChange={onChange("message")}
                  placeholder=" "
                />
                <span className="contacts-form__placeholder" aria-hidden="true">
                  Ваше повідомлення
                </span>
              </div>

              <button type="submit" className="contacts-form__submit" disabled={!isFormValid}>
                Відправити запит
              </button>
            </form>
          </section>

          <section className="contacts-page__right">
            <a
              className="contacts-page__card contacts-page__card--wide contacts-page__card--link"
              href="mailto:world.of.heelss@gmail.com"
            >
              <div className="contacts-info">
                <span className="contacts-info__chip">Email</span>
                <p className="contacts-info__value">world.of.heelss@gmail.com</p>
                <p className="contacts-info__hint">Відповідаємо протягом 1 години</p>
              </div>
            </a>

            <a
              className="contacts-page__card contacts-page__card--wide contacts-page__card--link"
              href="tel:+380679670163"
            >
              <div className="contacts-info">
                <span className="contacts-info__chip">Phone</span>
                <p className="contacts-info__value">+38 (067) 967 01 63</p>
                <p className="contacts-info__hint">Пн-Пт, з 9:00 до 19:00</p>
              </div>
            </a>

            <div className="contacts-page__social-grid">
              <a
                className="contacts-page__card contacts-page__card--social contacts-page__card--link"
                href="https://www.instagram.com/world.of_heels/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="contacts-info">
                  <span className="contacts-info__chip">Instagram</span>
                  <p className="contacts-info__value">@world.of_heels</p>
                </div>
              </a>
              <a
                className="contacts-page__card contacts-page__card--social contacts-page__card--link"
                href="https://t.me/woh_support"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="contacts-info">
                  <span className="contacts-info__chip">Telegram</span>
                  <p className="contacts-info__value">@woh.support</p>
                </div>
              </a>
              <a
                className="contacts-page__card contacts-page__card--social contacts-page__card--link"
                href="https://youtube.com/@world.of_heels?si=IoKj5SOFTvr-Yz6X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="contacts-info">
                  <span className="contacts-info__chip">YouTube</span>
                  <p className="contacts-info__value">@world.of_heels</p>
                </div>
              </a>
              <a
                className="contacts-page__card contacts-page__card--social contacts-page__card--link"
                href="https://www.tiktok.com/@world.of_heels?_r=1&_t=ZS-95mPRroZ0Dw"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="contacts-info">
                  <span className="contacts-info__chip">TikTok</span>
                  <p className="contacts-info__value">world.of.heels</p>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


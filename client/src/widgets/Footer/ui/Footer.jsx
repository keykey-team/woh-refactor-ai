import { Arrow, Logo, SocialLinks } from "@shared";
import Link from "next/link";

const Footer = ({ locale, categories, data }) => {
  const toLocalizedHref = (href) => {
    if (!href) return `/${locale}`;
    if (/^https?:\/\//i.test(href)) return href;
    if (href.startsWith(`/${locale}`)) return href;
    return href.startsWith("/")
      ? `/${locale}${href}`
      : `/${locale}/${href}`;
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <div className="footer__logo">
                <Logo />
              </div>

              <p className="footer__desc">
                {data.description}
              </p>

              <SocialLinks />
            </div>

            <div className="footer__cols">
              {data.columns.map((col) => {
                return (
                  <div
                    key={col.title}
                    className="footer__col"
                  >
                    <h3 className="footer__col-title">
                      {col.title}
                    </h3>
                    {col.id === "catalog" ? (
                      <ul className="footer__list">
                        {categories.items.map(
                          (item, index) => (
                            <li
                              key={index}
                              className="footer__item"
                            >
                              <Link
                                className="footer__link"
                                href={`/${locale}/categories/${item?.slug ?? ""}`}
                              >
                                <p>
                                  {
                                    item?.title?.[
                                      locale
                                    ]
                                  }
                                </p>
                              </Link>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <ul className="footer__list">
                        {col.items.map((item) => (
                          <li
                            key={item.id}
                            className="footer__item"
                          >
                            <Link
                              className="footer__link"
                              href={toLocalizedHref(
                                item.href,
                              )}
                            >
                              <p> {item.label}</p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="footer__contact">
              <h3 className="footer__col-title">
                {data.contacts.title}
              </h3>

              <ul className="footer__list">
                <li className="footer__item">
                  <a
                    className="footer__link"
                    href={`mailto:${data.contacts.email}`}
                  >
                    <p> {data.contacts.email}</p>
                  </a>
                </li>

                <li className="footer__item">
                  <a
                    className="footer__link"
                    href={`tel:${data.contacts.phone.replace(/\s|\(|\)|-/g, "")}`}
                  >
                    <p> {data.contacts.phone}</p>
                  </a>
                </li>

                <li className="footer__item">
                  <button
                    type="button"
                    className="footer__callback"
                  >
                    <p>
                      {data.contacts.callbackText}
                    </p>

                    <Arrow />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="container">
            <p className="footer__copy">
              {data.bottom.copyright}
            </p>

            <div className="footer__bottom-links">
              <button
                type="button"
                className="footer__bottom-link"
              >
                <p> {data.bottom.offer}</p>
              </button>

              <button
                type="button"
                className="footer__bottom-link"
              >
                {data.bottom.privacy}
              </button>

              <p className="footer__bottom-link">
                {data.bottom.madeBy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

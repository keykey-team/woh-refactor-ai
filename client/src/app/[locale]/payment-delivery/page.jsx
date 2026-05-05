import styles from "./payment-delivery.module.scss";
import {
  createI18nServer,
  getAllCategory,
  getLocalizedFooter,
  getMessages,
} from "@shared";
import PageHeader from "@shared/ui/PageHeader";
import Footer from "@widgets/Footer";

export default async function PaymentDeliveryPage({ params }) {
  const { locale = "ua" } = await params;
  const categories = await getAllCategory();
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const footerData = getLocalizedFooter(t);
  const pageTitle = t("navigation.footer.paymentDelivery");

  return (
    <div className={styles.pageShell}>
      <PageHeader
        locale={locale}
        breadcrumbsLabels={{
          home: t("breadcrumbs.home"),
          page: t("breadcrumbs.page"),
        }}
        breadcrumbsItems={[{ label: pageTitle }]}
        title={pageTitle}
      />

      <div className="container">
        <section className={styles.shell}>
          <div className={styles.card}>
            <h1 className={styles.title}>
              Замовлення на сайті приймаються 24/7, відправка пн-пт з 9:00 до 17:00
            </h1>

            <div className={styles.content}>
              <p>
                Доставка по Україні - здійснюється популярними транспортними службами - на
                відділення Нової Пошти, поштомат або кур’єром.
              </p>
              <p>Безкоштовна доставка по Україні при замовленні від 3000 грн.</p>
              <p>Мінімальна вартість доставки згідно з тарифами Нової пошти - від 60 грн.</p>
              <p>
                Спосіб оплати: Онлайн-оплата - банківською картою (Visa/MasterCard) через
                захищений сервіс LiqPay.
              </p>
              <p>
                Обмін та повернення - якщо товар має заводський брак або не відповідає
                замовленню, ви можете повернути або обміняти його відповідно до чинного
                законодавства України.
              </p>

              <p className={styles.strong}>В разі браку товару звертатись:</p>

              <p>
                <span className={styles.strong}>Телефон:</span>{" "}
                <a className={styles.link} href="tel:+380679670163">
                  +38 (067) 967 01 63
                </a>
              </p>
              <p>
                <span className={styles.strong}>Пошта:</span>{" "}
                <a className={styles.link} href="mailto:world.of.heelss@gmail.com">
                  world.of.heelss@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="products-layout-wrapper products-layout-wrapper--footer">
        <div className="container products-layout-wrapper__inner" />
        <Footer categories={categories} locale={locale} data={footerData} />
      </section>
    </div>
  );
}


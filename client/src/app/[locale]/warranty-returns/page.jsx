import styles from "./warranty-returns.module.scss";
import {
  createI18nServer,
  getAllCategory,
  getLocalizedFooter,
  getMessages,
} from "@shared";
import PageHeader from "@shared/ui/PageHeader";
import Footer from "@widgets/Footer";

export default async function WarrantyReturnsPage({ params }) {
  const { locale = "ua" } = await params;
  const categories = await getAllCategory();
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const footerData = getLocalizedFooter(t);

  const pageTitle = t("navigation.footer.warrantyReturns");

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
            <p className={styles.strong}>Гарантія від World of Heels</p>

            <div className={styles.content}>
              <p>
                Ми прагнемо забезпечити наших клієнтів якісними та надійними товарами,тому
                гарантуємо:
              </p>
              <p>
                Оригінальність продукції - ми працюємо лише з офіційними постачальниками та
                перевіреними виробниками.
              </p>
              <p>
                Гарантійне обслуговування - на всі товари діє офіційна гарантія від
                виробника.
              </p>
              <p>
                Термін гарантії залежить від конкретного продукту та зазначений в описі
                товару.
              </p>
              <p>
                <span className={styles.strongInline}>Обмін та повернення</span> - якщо
                товар має заводський брак або не відповідає замовленню, ви можете повернути
                або обміняти його відповідно до чинного законодавства України.
              </p>
              <p>
                Контроль якості - перед відправленням кожен товар проходить перевірку на
                відповідність заявленим характеристикам.
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


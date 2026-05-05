import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { getAllCategory, getLocalizedFooter } from "@shared";
import { getCurrentUser } from "@shared/api/authServices";
import PageHeader from "@shared/ui/PageHeader";
import Footer from "@widgets/Footer";
import ProfileSidebar from "@widgets/profile";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfileLayout({ children, params }) {
  const { locale } = await params;
  
  
  const headersList = await headers();
  const fullUrl = headersList.get("referer") || ""; 
  
  
  const urlParts = fullUrl.split('/');
  const lastSegment = urlParts[urlParts.length - 1];
  
  const isOrderNumber = lastSegment && !isNaN(lastSegment) && lastSegment.length < 10;

  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const categories = await getAllCategory();
  const footerData = getLocalizedFooter(t);

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  
  if (!token?.value) {
    redirect(`/`);
  }

  try {
    await getCurrentUser(token.value);
  } catch (e) {
    const status = Number(e?.status);
    if (status === 401) {
      redirect("/api/auth/clear");
    }
  }

 
  const breadcrumbsItems = isOrderNumber
    ? [
        { label: t("breadcrumbs.prof"), path: `/${locale}/profile/info` },
        { label: `${t("profile.order-title")} #${lastSegment}` },
      ]
    : [{ label: t("breadcrumbs.prof") }];

  const title = isOrderNumber
    ? `${t("profile.order-title")} #${lastSegment}`
    : t("breadcrumbs.prof");
  return (
    <div className="profile-page-shell">
      <PageHeader
        locale={locale}
        breadcrumbsLabels={{
          home: t("breadcrumbs.home"),
          page: t("breadcrumbs.page"),
        }}
        breadcrumbsItems={breadcrumbsItems}
        title={title}
      />

      <div className="profile-container">
        <ProfileSidebar />

        <div className="profile-content " >
          {children}
        </div>
      </div>

      <section className="products-layout-wrapper products-layout-wrapper--footer">
        <div className="container products-layout-wrapper__inner" />
        <Footer
          categories={categories}
          locale={locale}
          data={footerData}
        />
      </section>
    </div>
  );
}
import OrderItem from "@entities/order-item/ui/OrderItem";
import { getCurrentUser } from "@shared/api/authServices";
import { getUserOrders } from "@shared/api/orderServices";
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function HistoryPage({
    params,
}) {
    const { locale = "ua" } = await params;
    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    const user = await getCurrentUser(token.value)
    const orders = await getUserOrders(token.value)
    const normalizedOrders = Array.isArray(orders) ? orders : [];
   
    return (
        <div className="profile-page">
            <div className="profile-page__prev">
                <p className="profile-page__subtitle">{t('profile.subtitle-history')}</p>
                <h2 className="profile-page__title">{t("profile.title-history")}</h2>
            </div>
            {normalizedOrders.length === 0 ? (
              <div className="profile-history profile-history--empty">
                <p>{t("profile.noOrders")}</p>
                <Link href={`/${locale}/categories/all`} className="basket__action">
                  <p>{t("basket.startShopping")}</p>
                </Link>
              </div>
            ) : (
              <div className="profile-history">
                {normalizedOrders.map((order, index) => (
                  <OrderItem order={order} key={index} locale={locale} />
                ))}
              </div>
            )}

        </div>
    );
}
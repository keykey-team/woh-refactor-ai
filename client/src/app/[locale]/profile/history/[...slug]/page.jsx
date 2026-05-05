import { getCities, getWarehouses } from "@shared/api/Nova-poshta";
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrderPage({ params }) {
  const { locale = "ua", slug } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  if (!token?.value) redirect("/");

  async function parseJsonSafe(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async function fetchUserOrdersOrThrow(authToken) {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${base}/iam/user/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const err = new Error(data?.message || "Failed to fetch orders");
      err.status = response.status;
      throw err;
    }
    return Array.isArray(data) ? data : [];
  }

  let orders = [];
  try {
    orders = await fetchUserOrdersOrThrow(token.value);
  } catch (e) {
    const status = Number(e?.status);
    if (status === 401) {
      redirect("/api/auth/clear");
    }
    orders = [];
  }

  const foundOrder = orders.find(
    (order) => String(order?.order_number ?? order?.orderNumber ?? "") === String(slug),
  );

  if (!foundOrder) {
    return (
      <div className="profile-page">
        <div className="profile-page__prev or">
          <p className="profile-page__subtitle">{t("profile.orderNotFound")}</p>
          <h2 className="profile-page__title">
            {t("profile.order-title")} #{slug}
          </h2>
        </div>

        <div className="profile-ord profile-ord--empty">
          <p>{t("profile.orderNotFound")}</p>
          <Link href={`/${locale}/profile/history`} className="basket__action">
            <p>{t("profile.backToOrders")}</p>
          </Link>
        </div>
      </div>
    );
  }

  const currentOrder = foundOrder;

  const getStatusVariant = (status) => {
    const s = String(status ?? "").trim().toLowerCase();
    if (s.includes("виконано") || s.includes("delivered") || s.includes("completed") || s.includes("paid")) {
      return "done";
    }
    if (s.includes("скасовано") || s.includes("cancel") || s.includes("cancelled")) {
      return "cancelled";
    }
    return "processing";
  };

  const statusVariant = getStatusVariant(currentOrder?.status);

  let displayCity = currentOrder.deliveryCity;
  let displayWarehouse = currentOrder.deliveryPostOffice;

  try {
    if (
      currentOrder.deliveryProvince &&
      currentOrder.deliveryCity?.includes("-")
    ) {
      const cities = await getCities(currentOrder.deliveryProvince);
      const foundCity = cities.find((c) => c.Ref === currentOrder.deliveryCity);
      if (foundCity) displayCity = foundCity.Description;
    }

    if (
      currentOrder.deliveryCity &&
      currentOrder.deliveryPostOffice?.includes("-")
    ) {
      const branches = await getWarehouses(currentOrder.deliveryCity, "branch");
      const foundBranch = branches.find(
        (b) => b.Ref === currentOrder.deliveryPostOffice,
      );
      if (foundBranch) {
        displayWarehouse = foundBranch.Description;
      } else {
        const postomats = await getWarehouses(
          currentOrder.deliveryCity,
          "postomat",
        );
        const foundPostomat = postomats.find(
          (p) => p.Ref === currentOrder.deliveryPostOffice,
        );
        if (foundPostomat) displayWarehouse = foundPostomat.Description;
      }
    }
  } catch {}
  // -------------------------------------

  return (
    <div className="profile-page">
      <div className="profile-page__prev or">
        <nav className="breadcrumbs">
          <Link href={`/${locale}/profile/info`} className="breadcrumbs__link">
            {t("breadcrumbs.prof")}
          </Link>
          <span className="breadcrumbs__sep">/</span>
          <Link href={`/${locale}/profile/history`} className="breadcrumbs__link">
            {t("profile.link2")}
          </Link>
          <span className="breadcrumbs__sep">/</span>
          <span className="breadcrumbs__current">
            {t("profile.order-title")} #{slug}
          </span>
        </nav>
        <p className="profile-page__subtitle">
          {t("profile.order-br")} #{slug}
        </p>
        <h2 className="profile-page__title">
          {t("profile.order-title")} #{slug}
        </h2>
      </div>
      <div className="profile-ord">
        <div className="profile-ord__header">
          <p>{t("profile.order-data")}</p>
        </div>
        <div className="profile-ord__stats">
          <p className="label">{t("profile.order-stats1")}</p>
          <p className={`data order__header-status order__header-status--${statusVariant}`}>
            {currentOrder.status}
          </p>
        </div>
        <div className="profile-ord__stats">
          <p className="label">{t("profile.order-stats2")}</p>
          <p className="data">
            {currentOrder.firstName} {currentOrder.lastName}
          </p>
        </div>
        <div className="profile-ord__stats">
          <p className="label">{t("profile.order-stats3")}</p>
          <p className="data">{currentOrder.customerEmail}</p>
        </div>
        <div className="profile-ord__stats">
          <p className="label">{t("profile.order-stats4")}</p>
          <p className="data">{currentOrder.customerPhone}</p>
        </div>
        <div className="profile-ord__stats">
          <p className="label">{t("profile.order-stats5")}</p>
          <p className="data">Нова пошта</p>
        </div>
        <div className="profile-ord__stats">
          <p className="label">{t("profile.order-stats6")}</p>
          <p className="data">{displayCity}</p>
        </div>
        <div className="profile-ord__stats">
          <p className="label">{t("profile.order-stats7")}</p>
          <p className="data">{displayWarehouse}</p>
        </div>
      </div>

      <div className="profile-ord">
        <div className="profile-ord__header">
          <p>{t("profile.order-t")}</p>
        </div>
        <div className="order__list">
          {(Array.isArray(currentOrder.items) ? currentOrder.items : []).map((el, index) => (
            <div key={index} className="order-item">
              <div className="order-item__wrapper">
                <Image
                  src={el.imgSnapshot || el.offerId?.img || "/no-image.png"}
                  alt="prod"
                  width={50}
                  height={50}
                />
                <p className="t">{el.titleSnapshot || el.offerId?.sku}</p>
              </div>
              <div className="order-item__wrapper">
                <p className="order-item__quantity">{el.qty} шт</p>
                <p className="order-item__cost">{el.pricePerUnit} ₴</p>
              </div>
            </div>
          ))}
        </div>
        <div className="order__func">
          <p>{t("profile.order-all")}</p>
          <p className="bl">{currentOrder.totalToPay} ₴</p>
        </div>
      </div>

      <button type="button" className="profile-ord__repeat">
        Повторити замовлення
      </button>
    </div>
  );
}

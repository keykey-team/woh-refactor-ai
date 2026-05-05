import Link from "next/link";

export default async function SuccessOrderPage({ params, searchParams }) {
  const { locale = "ua" } = await params;

  const orderNumber = searchParams?.orderNumber
    ? String(searchParams.orderNumber)
    : "";

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h2 style={{ marginBottom: 12 }}>
        {orderNumber
          ? `Замовлення №${orderNumber} прийнято`
          : "Замовлення прийнято"}
      </h2>
      <p style={{ marginBottom: 24 }}>
        {orderNumber
          ? "Дякуємо! Ми зв’яжемося з вами найближчим часом для підтвердження."
          : "Дякуємо! Ми зв’яжемося з вами найближчим часом для підтвердження."}
      </p>
      <Link href={`/${locale}/`} style={{ fontWeight: 700 }}>
        Повернутися на головну
      </Link>
    </div>
  );
}


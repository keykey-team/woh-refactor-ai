export const getLocalizedFooter = (t) => ({
  description: t("footer.description"),

  columns: [
    {
      id: "catalog",
      title: t("footer.structure"),
      items: [
        {
          id: "skin",
          label: t("footer.structures.skin"),
          href: "/structure/skin",
        },
        {
          id: "hair",
          label: t("footer.structures.hair"),
          href: "/structure/hair",
        },
        {
          id: "balance",
          label: t("footer.structures.balance"),
          href: "/structure/balance",
        },
        {
          id: "stress",
          label: t("footer.structures.stress"),
          href: "/structure/stress",
        },
        {
          id: "gut",
          label: t("footer.structures.gut"),
          href: "/structure/gut",
        },
        {
          id: "womenMen",
          label: t("footer.structures.womenMen"),
          href: "/structure/women-men-40",
        },
      ],
    },

    {
      id: "list",
      title: t("footer.company"),
      items: [
        {
          id: "about-us",
          label: t("navigation.footer.aboutUs"),
          href: "/about",
        },
        {
          id: "payment-delivery",
          label: t(
            "navigation.footer.paymentDelivery",
          ),
          href: "/payment-delivery",
        },
        {
          id: "warranty-returns",
          label: t(
            "navigation.footer.warrantyReturns",
          ),
          href: "/warranty-returns",
        },
        {
          id: "contacts",
          label: t("navigation.header.contacts"),
          href: "/contacts",
        },
        {
          id: "cooperation",
          label: t("navigation.footer.cooperation"),
          href: "/cooperation",
        },
      ],
    },
  ],

  contacts: {
    title: t("footer.contact"),
    email: t("footer.contacts.email"),
    phone: t("footer.contacts.phone"),
    callbackText: t("footer.contacts.callback"),
  },

  bottom: {
    copyright: t("footer.bottom.copyright"),
    offer: t("footer.bottom.offer"),
    privacy: t("footer.bottom.privacy"),
    madeBy: t("footer.bottom.madeBy"),
  },
});
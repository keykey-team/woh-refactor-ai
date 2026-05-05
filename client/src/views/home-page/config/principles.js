export const getLocalizedPrinciples = (t) => ({
  sectionTitle: t("principles.sectionTitle"),

  topCards: [
    {
      id: "quality",
      tone: "violet",
      title: t("principles.cards.quality.title"),
      items: t("principles.cards.quality.items"),
      buttonText: t(
        "principles.cards.quality.button",
      ),
    },
    {
      id: "system",
      tone: "green",
      title: t("principles.cards.system.title"),
      items: t("principles.cards.system.items"),
      buttonText: t(
        "principles.cards.system.button",
      ),
    },
  ],

  bottomCards: [
    {
      id: "care",
      tone: "outline",
      title: t("principles.cards.care.title"),
      buttonText: t(
        "principles.cards.care.button",
      ),
    },
    {
      id: "balance",
      tone: "outline",
      title: t("principles.cards.balance.title"),
      buttonText: t(
        "principles.cards.balance.button",
      ),
    },
  ],
});

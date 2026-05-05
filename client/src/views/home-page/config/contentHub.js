export const getLocalizedContentHub = (t) => {
  const cardsObj = t("contentHub.cards");

  const cards = Object.values(cardsObj || {}).map(
    (card) => ({
      id: card.id,
      date: card.date,
      title: card.title,
      text: card.text,
      linkText: card.link,
      tone: card.tone,
    }),
  );

  return {
    sectionTitle: t("contentHub.sectionTitle"),

    mainCard: {
      mainImage: t(
        "contentHub.mainCard.mainImage",
      ),
      title: t("contentHub.mainCard.title"),
      text: t("contentHub.mainCard.text"),
      button: t("contentHub.mainCard.button"),
    },

    cards,
  };
};

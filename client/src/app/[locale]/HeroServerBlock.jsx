import {
  createI18nServer,
  getHomeBanners,
  getLocalizedHeroSlides,
  getMessages,
  HOME_BANNER_FALLBACK,
} from "@shared";
import Hero from "@widgets/hero";

function pickLocalized(value, locale) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const loc = locale === "en" ? "en" : "ua";
    const raw = value[loc] ?? value.ua ?? value.en ?? "";
    return typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
  }
  return String(value).trim();
}

function normalizeLink(link) {
  if (typeof link !== "string") return "";
  return link.trim();
}

function buildSlidesFromApi(items, baseSlides, locale) {
  const sorted = [...items].sort(
    (a, b) => Number(a?.position ?? 0) - Number(b?.position ?? 0),
  );

  return sorted.map((b, i) => {
    const fallback = baseSlides[i % baseSlides.length];
    const imageURL =
      typeof b?.imageURL === "string" && b.imageURL.trim()
        ? b.imageURL.trim()
        : HOME_BANNER_FALLBACK;
    const mobileImageURL =
      typeof b?.mobileImageURL === "string" && b.mobileImageURL.trim()
        ? b.mobileImageURL.trim()
        : imageURL;

    const titleFromApi = pickLocalized(b?.title, locale);
    const subtitleStr = pickLocalized(b?.subtitle, locale);

    return {
      id: String(b?._id ?? `banner-${i}`),
      imageURL,
      mobileImageURL,
      link: normalizeLink(b?.link),
      title: titleFromApi || fallback.title,
      lines: subtitleStr ? [subtitleStr] : fallback.lines,
    };
  });
}

function buildFallbackSlides(baseSlides) {
  return baseSlides.map((s) => ({
    ...s,
    imageURL: HOME_BANNER_FALLBACK,
    mobileImageURL: HOME_BANNER_FALLBACK,
    link: "",
  }));
}

export default async function HeroServerBlock({ locale }) {
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const baseSlides = getLocalizedHeroSlides(t);

  const res = await getHomeBanners();

  const slides =
    res.ok && Array.isArray(res.items) && res.items.length > 0
      ? buildSlidesFromApi(res.items, baseSlides, locale)
      : buildFallbackSlides(baseSlides);

  return <Hero slides={slides} />;
}

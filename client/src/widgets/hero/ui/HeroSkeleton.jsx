export default function HeroSkeleton() {
  return (
    <section
      className="hero-section section-margin hero-section--skeleton"
      aria-busy="true"
      aria-label="Завантаження банера"
    >
      <div className="hero hero--skeleton">
        <div className="hero__skeleton-banner" />
        <div className="container hero__container hero__container--skeleton">
          <div className="hero__skeleton-chip" />
          <div className="hero__skeleton-title" />
          <div className="hero__skeleton-title hero__skeleton-title--short" />
          <div className="hero__skeleton-button" />
        </div>
        <div className="hero__pagination hero__pagination--skeleton">
          <span className="hero__skeleton-bullet" />
          <span className="hero__skeleton-bullet" />
          <span className="hero__skeleton-bullet" />
        </div>
      </div>
    </section>
  );
}

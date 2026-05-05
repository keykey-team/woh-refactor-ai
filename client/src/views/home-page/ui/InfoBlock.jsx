"use client";

const InfoBlock = ({ data }) => {
  if (!data) return null;

  const {
    title,
    text,
    primaryText,
    secondaryText,
  } = data;

  return (
    <section className="info-block section-margin">
      <div className="info-block__inner">
        <h3 className="info-block__title">
          {title}
        </h3>
        <p className="info-block__text">{text}</p>
      </div>

      <div className="info-block__actions">
        <button
          type="button"
          className="info-block__btn"
        >
          <p>{primaryText}</p>
        </button>

        <button
          type="button"
          className="info-block__btn info-block__btn--primary"
        >
          <p> {secondaryText}</p>
        </button>
      </div>
    </section>
  );
};

export default InfoBlock;

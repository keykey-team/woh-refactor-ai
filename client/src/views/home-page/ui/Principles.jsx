"use client";

import { StarDecor } from "@shared";

const Principles = ({ data }) => {
  const { sectionTitle, topCards, bottomCards } =
    data;

  return (
    <section className="principles section-margin">
      <h2 className="principles__title">
        {sectionTitle}
      </h2>

      <div className="principles__grid">
        <div className="principles__top">
          {topCards.map((card) => (
            <article
              key={card.id}
              className={`principles__card principles__card--top principles__card--${card.tone}`}
            >
              <h3 className="principles__card-title">
                {card.title}
              </h3>

              <ul className="principles__list">
                {card.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="principles__list-item"
                  >
                    <StarDecor />

                    <p className="principles__list-text">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>

              <button className="principles__button">
                <p> {card.buttonText}</p>
              </button>
            </article>
          ))}
        </div>

        <div className="principles__bottom">
          {bottomCards.map((card) => (
            <article
              key={card.id}
              className="principles__bottom-card"
            >
              <h3 className="principles__card-title">
                {card.title}
              </h3>

              <button className="principles__button-outline">
                <p> {card.buttonText}</p>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Principles;

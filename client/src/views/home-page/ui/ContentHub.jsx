"use client";

import { Arrow } from "@shared";
import Image from "next/image";

const ContentHub = ({ data }) => {
  if (!data) return null;

  const {
    sectionTitle,
    mainCard,
    cards = [],
  } = data;

  return (
    <section className="content-hub section-margin">
      <h2 className="content-hub__title">
        {sectionTitle}
      </h2>

      <div className="content-hub__grid">
        <article className="content-hub__main">
          <div className="content-hub__main-top">
            <h3 className="content-hub__main-title">
              {mainCard.title}
            </h3>
            <p className="content-hub__main-text">
              {mainCard.text}
            </p>

            <button className="content-hub__main-button">
              <p>{mainCard.button}</p>
            </button>
          </div>

          <Image
            className="content-hub__main-img"
            src={mainCard.mainImage}
            alt={mainCard.title}
            width={785}
            height={387}
          />
        </article>

        <div className="content-hub__side">
          {cards.map((c) => (
            <article
              key={c.id}
              className={`content-hub__card content-hub__card--${c.tone || "violet"}`}
            >
              <div
                className={`content-hub__date content-hub__date--${c.tone || "violet"}`}
              >
                {c.date}
              </div>

              <h3 className="content-hub__card-title">
                {c.title}
              </h3>
              <p className="content-hub__card-text">
                {c.text}
              </p>

              <button
                className={`content-hub__card-button content-hub__card-button--${c.tone || "violet"}`}
              >
                <p> {c.linkText}</p>

                <Arrow />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentHub;

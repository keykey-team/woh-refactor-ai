import Image from "next/image";

const AboutUs = ({ data }) => {
  return (
    <section className="about section-margin">
      <h2 className="about__section-title">
        {data.sectionTitle}
      </h2>
      <div className="about__grid">
        <div className="about__content">
          <h3 className="about__title">
            {data.title}
          </h3>
          <p className="about__text">
            {data.text}
          </p>

          <button className="about__btn">
            <p> {data.buttonText}</p>
          </button>
        </div>

        <div className="about__img-wrap">
          <Image
            className="about__img"
            width={738}
            height={440}
            src={data.imageSrc}
            alt={data.imageAlt}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

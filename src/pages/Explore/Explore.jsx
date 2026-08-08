import { Link } from "react-router-dom";
import "./Explore.css";

function Explore() {
  const features = [
    {
      number: "01",
      icon: "⚡",
      title: "High Performance",
      subtitle: "ENGINEERED FOR SPEED",
      text: "Built for speed, scalability and next-generation digital applications.",
      path: "/performance",
    },
    {
      number: "02",
      icon: "🔒",
      title: "Secure by Design",
      subtitle: "BUILT ON TRUST",
      text: "Security is integrated into every layer of the TEKA experience.",
      path: "/security",
    },
    {
      number: "03",
      icon: "◆",
      title: "Premium Experience",
      subtitle: "DESIGNED DIFFERENTLY",
      text: "Minimal, refined and crafted with attention to every interaction.",
      path: "/premium",
    },
    {
      number: "04",
      icon: "◎",
      title: "Global Vision",
      subtitle: "BUILT FOR EVERYWHERE",
      text: "A technology vision designed to reach users everywhere.",
      path: "/global-vision",
    },
  ];

  return (
    <main className="explore-page">

      <div className="explore-noise"></div>

      <div className="explore-orb explore-orb-one"></div>
      <div className="explore-orb explore-orb-two"></div>

      {/* HERO */}

      <section className="explore-hero">

        <div className="explore-eyebrow">
          <span></span>
          DISCOVER TEKA
          <span></span>
        </div>

        <h1>
          Explore
          <strong>TEKA<span>.</span></strong>
        </h1>

        <p>
          More than a website.
          <br />
          A vision for what comes next.
        </p>

        <div className="explore-line"></div>

        <div className="explore-scroll">
          <span>SCROLL TO DISCOVER</span>
          <div className="scroll-arrow">↓</div>
        </div>

      </section>


      {/* FEATURES */}

      <section className="explore-features">

        <div className="explore-section-header">

          <div>
            <span className="section-label">THE TEKA EXPERIENCE</span>

            <h2>
              Built around
              <br />
              <span>possibility.</span>
            </h2>
          </div>

          <p>
            Explore the principles behind TEKA and
            discover what we're building for the next
            era of digital innovation.
          </p>

        </div>


        <div className="explore-grid">

          {features.map((feature) => (

            <Link
              to={feature.path}
              className="explore-card"
              key={feature.number}
            >

              <div className="card-glow"></div>

              <div className="card-top">

                <span className="card-number">
                  {feature.number}
                </span>

                <span className="card-icon">
                  {feature.icon}
                </span>

              </div>


              <div className="card-content">

                <span className="card-subtitle">
                  {feature.subtitle}
                </span>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.text}
                </p>

              </div>


              <div className="card-bottom">

                <span>
                  EXPLORE
                </span>

                <span className="card-arrow">
                  ↗
                </span>

              </div>

            </Link>

          ))}

        </div>

      </section>


      {/* FINAL CTA */}

      <section className="explore-final">

        <div className="final-glow"></div>

        <span className="section-label">
          THE NEXT CHAPTER
        </span>

        <h2>
          The future
          <br />
          starts <span>here.</span>
        </h2>

        <p>
          TEKA is building a new digital experience,
          <br />
          one idea at a time.
        </p>

        <Link
          to="/contact"
          className="explore-cta"
        >
          Connect With TEKA
          <span>→</span>
        </Link>

      </section>

    </main>
  );
}

export default Explore;
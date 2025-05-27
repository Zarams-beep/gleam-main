import "@/styles/HomePage.css";
import Image from "next/image";
import { PiSmileyMeltingFill } from "react-icons/pi";
export default function HomePageThird() {
  return (
    <>
      <div className="why-gleam-section">
        <header className="feature-header">
          <h2 className="">Why</h2>
          <div className="feature-header-2">
            <h2 className="">Gleam Works</h2>
            <PiSmileyMeltingFill className="icon-features" />
          </div>
        </header>
        <div className="impact-cards-container">
          <div className="impact-card">
            <div className="img-component">
              <Image
                src="/cristofer-maximilian-NSKP7Gwa_I0-unsplash.jpg"
                alt="Impact-img"
                width={300}
                height={300}
                quality={100}
                className="impact-img"
              />
            </div>
            <div className="impact-overlay">
              <h3>82% feel more recognized</h3>
              <p>
                Our users report feeling more valued and seen after just one
                week of using Gleam.
              </p>
            </div>
          </div>

          <div className="impact-card">
            <div className="img-component">
              <Image
                src="/olena-bohovyk-DmeZC9riGkk-unsplash.jpg"
                alt="Impact-img-2"
                width={300}
                height={300}
                quality={100}
                className="impact-img"
              />
            </div>
            <div className="impact-overlay">
              <h3>25% morale boost</h3>
              <p>
                Companies saw improved team morale after introducing Gleam’s
                daily compliment ritual.
              </p>
            </div>
          </div>

          <div className="impact-card">
            <div className="img-component">
              <Image
                src="/toa-heftiba-z9snuPiPKgQ-unsplash.jpg"
                alt="Impact-img-2"
                width={300}
                height={300}
                quality={100}
                className="impact-img"
              />
            </div>
            <div className="impact-overlay">
              <h3>Positive Work Culture</h3>
              <p>
                Gleam makes gratitude part of the culture—empowering people to
                lift each other up.
              </p>
            </div>
          </div>

          <div className="impact-card">
  <div className="img-component">
    <Image
      src="/s-o-c-i-a-l-c-u-t--3jdwGuAEnk-unsplash.jpg"
      alt="Impact-img-4"
      width={300}
      height={300}
      quality={100}
      className="impact-img"
    />
  </div>
  <div className="impact-overlay">
    <h3>Gratitude Drives Performance</h3>
    <p>
      Employees who feel appreciated are more engaged, leading to stronger performance and retention.
    </p>
  </div>
</div>

        </div>
      </div>
    </>
  );
}

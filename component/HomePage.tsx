import "@/styles/HomePage.css";
import Image from "next/image";
import FeaturesSection from "./HomePageFeatures";
import HomePageThird from "./HomePageThird";
import FAQComponent from "@/component/FAQ";
import TestimonialSection from "./MeetTeam";

export default function HomePageSection() {
  return (
    <div className="container2 home-page-container">
      {/* hero-section */}
      <div className="hero-section">
        <div className="hero-header">
          <h2>Bring a Little Gleam to Your Team</h2>
          <p>
            Create a workplace where kindness flows, one anonymous compliment at a time.
          </p>
          <div className="hero-cta">
            <button className="cta-primary">Start for Free</button>
            <button className="cta-secondary">How It Works</button>
          </div>
        </div>

        <div className="hero-img-container">
          <Image
            src="/caroline-attwood-983a7uWhdSs-unsplash.jpg"
            alt="Hero-img-1"
            width={300}
            height={300}
            quality={100}
            className="hero-img hero-img-1"
          />
          <Image
            src="/jason-leung-uhxiOmoVhOo-unsplash.jpg"
            alt="Hero-img-2"
            width={300}
            height={300}
            quality={100}
            className="hero-img hero-img-2"
          />
          <Image
            src="/jerome-z-wS695XkKA-unsplash.jpg"
            alt="Hero-img-3"
            width={300}
            height={300}
            quality={100}
            className="hero-img hero-img-3"
          />
        </div>
      </div>

      <FeaturesSection/>
      <HomePageThird/>
      <FAQComponent/>
      <TestimonialSection/>
    </div>
  );
}

// components/AboutHero.tsx
import Image from "next/image";
import teamSmile from "@/public/caroline-attwood-983a7uWhdSs-unsplash.jpg"; 

export default function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero-2 container2">
        {/* Text Content */}
        <div className="about-hero-text">
          <h1 className="">
            Spreading Positivity,<br />
            One Compliment at a Time
          </h1>
          <p className="">
            Gleam helps companies foster workplace happiness through simple, anonymous compliments.
            Because every kind word makes a difference.
          </p>
        </div>

        {/* Image */}
        <div className="about-hero-img">
          <Image
            src={teamSmile}
            alt="Happy team smiling"
            quality="40"
            // layout="fill"
            // objectFit="cover"
            className=""
            // priority
          />
        </div>
      </div>
    </section>
  );
}

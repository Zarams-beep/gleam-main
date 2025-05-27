"use client";
import Image from "next/image";
import Link from "next/link";
import { PiSmileyMeltingFill } from "react-icons/pi";
export default function OurStorySection() {
  return (
    <section className="story-section container2">
      <header className="header-story-section">
      <h2 className="">
        Why We 
        <span>Built Gleam
        <PiSmileyMeltingFill className="fill-melt"/></span>
      </h2>

      <h4 className="">
        The spark that formed this was the need to see love in the world, to share it and ease one another's pain.
      </h4>
      </header>

      <div className="story-content">
        {/* Image Section */}
        <div className="story-img">
          <Image
            src="/s-o-c-i-a-l-c-u-t--3jdwGuAEnk-unsplash.jpg"
            alt="Founders discussing"
            width={600}
            height={400}
            quality={40}
            className=""
          />
        </div>

        {/* Text Section */}
        <div className="story-text">
          <p>
            Gleam started with one small compliment that changed an entire
            team's day. We realized that kindness was contagious—and that
            workplaces were missing a simple way to spread it.
          </p>
          <p>
            That realization sparked something deeper. What if anonymous
            positivity could be the secret to healthier teams, better
            communication, and happier people?
          </p>

          {/* Call-to-Action Button */}
          <div className="story-btn">
          <button className="">
          <Link href="/about-us/story">
              Read Full Story →
          </Link>
            </button>
          </div> 
        </div>
      </div>
    </section>
  );
}

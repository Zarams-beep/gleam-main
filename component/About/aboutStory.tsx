"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PiSmileyMeltingFill } from "react-icons/pi";

export default function OurStorySection() {
  return (
    <section className="story-section container">
      {/* Header Animation */}
      <motion.header
        className="header-story-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.3 }}
      >
        <h2>
          Why We{" "}
          <span>
            Built Gleam <PiSmileyMeltingFill className="fill-melt" />
          </span>
        </h2>

        <h4>
          The spark that formed this was the need to see love in the world, to
          share it and ease one another's pain.
        </h4>
      </motion.header>

      <div className="story-content">
        {/* Image Animation */}
        <motion.div
          className="story-img"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <Image
            src="/s-o-c-i-a-l-c-u-t--3jdwGuAEnk-unsplash.jpg"
            alt="Founders discussing"
            width={600}
            height={400}
            quality={40}
          />
        </motion.div>

        {/* Text Animation */}
        <motion.div
          className="story-text"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <p>
            Gleam started with one small compliment that changed an entire
            team's day. We realized that kindness was contagious and that
            workplaces were missing a simple way to spread it.
          </p>
          <p>
            That realization sparked something deeper. What if anonymous
            positivity could be the secret to healthier teams, better
            communication, and happier people?
          </p>

          {/* Button Animation */}
          <motion.div
            className="story-btn"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <button>
              <Link href="/about-us/story">Read Full Story →</Link>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

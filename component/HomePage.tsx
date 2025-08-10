"use client";
import "@/styles/HomePage.css";
import Image from "next/image";
import FeaturesSection from "./HomePageFeatures";
import HomePageThird from "./HomePageThird";
import FAQComponent from "@/component/FAQ";
import TestimonialSection from "./MeetTeam";
import { motion } from "framer-motion";

export default function HomePageSection() {
  return (
    <div className="home-page-container">
      {/* hero-section */}
      <div className="hero-section container">
        {/* Right column animation */}
        <motion.div
          initial={{ opacity: 0, y: 80, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.8, 0.25, 1],
          }}
          className="hero-header"
        >
          <h2>Bring a Little Gleam to Your Team</h2>
          <p>
            Create a workplace where kindness flows, one anonymous compliment
            at a time.
          </p>
          <div className="hero-cta">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-primary"
            >
              Start for Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-secondary"
            >
              How It Works
            </motion.button>
          </div>
        </motion.div>

        {/* Left column animation */}
        <motion.div
          initial={{ opacity: 0, y: -80, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.25, 0.8, 0.25, 1],
          }}
          className="hero-img-container"
        >
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
        </motion.div>
      </div>

      <FeaturesSection />
      <HomePageThird />
      <FAQComponent />
      <TestimonialSection />
    </div>
  );
}

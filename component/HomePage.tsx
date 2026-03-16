// component/HomePage.tsx
// ─── Hero CTAs wired to router + How It Works scrolls to features ─────────────
"use client";
import "@/styles/HomePage.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FeaturesSection from "./HomePageFeatures";
import HomePageThird from "./HomePageThird";
import FAQComponent from "@/component/FAQ";
import TestimonialSection from "./MeetTeam";
import { motion } from "framer-motion";

export default function HomePageSection() {
  const router = useRouter();

  const scrollToFeatures = () => {
    document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="home-page-container">
      {/* Hero section */}
      <div className="hero-section container">
        <motion.div
          initial={{ opacity: 0, y: 80, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
          className="hero-header"
        >
          <h2>Bring a Little Gleam to Your Team</h2>
          <p>
            Create a workplace where kindness flows, one anonymous compliment
            at a time.
          </p>
          <div className="hero-cta">
            {/* ✅ Wired to sign-up page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-primary"
              onClick={() => router.push("/sign-up")}
            >
              Start for Free
            </motion.button>

            {/* ✅ Scrolls down to the features section */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-secondary"
              onClick={scrollToFeatures}
            >
              How It Works
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -80, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
          className="hero-img-container"
        >
          {/* ✅ priority prop on hero images — they're above the fold (LCP) */}
          <Image
            src="/caroline-attwood-983a7uWhdSs-unsplash.jpg"
            alt="Happy team member"
            width={300}
            height={300}
            quality={100}
            priority
            className="hero-img hero-img-1"
          />
          <Image
            src="/jason-leung-uhxiOmoVhOo-unsplash.jpg"
            alt="Smiling colleague"
            width={300}
            height={300}
            quality={100}
            priority
            className="hero-img hero-img-2"
          />
          <Image
            src="/jerome-z-wS695XkKA-unsplash.jpg"
            alt="Team at work"
            width={300}
            height={300}
            quality={100}
            priority
            className="hero-img hero-img-3"
          />
        </motion.div>
      </div>

      {/* ✅ id added so "How It Works" button can scroll here */}
      <div id="features-section">
        <FeaturesSection />
      </div>
      <HomePageThird />
      <FAQComponent />
      <TestimonialSection />
    </div>
  );
}

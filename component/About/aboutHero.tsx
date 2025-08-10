"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import teamSmile from "@/public/caroline-attwood-983a7uWhdSs-unsplash.jpg";

export default function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero-2 container">
        {/* Text Content */}
        <motion.div
          className="about-hero-text"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h1>
            Spreading Positivity,<br />
            One Compliment at a Time
          </h1>
          <p>
            Gleam helps companies foster workplace happiness through simple,
            anonymous compliments.
            Because every kind word makes a difference.
          </p>
        </motion.div>

        {/* Image */}
        <motion.div
          className="about-hero-img"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <Image
            src={teamSmile}
            alt="Happy team smiling"
            quality={40}
            className=""
          />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import "@/styles/HomePage.css";
import Image from "next/image";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { motion } from "framer-motion";

export default function HomePageThird() {
  const cards = [
    {
      img: "/cristofer-maximilian-NSKP7Gwa_I0-unsplash.jpg",
      title: "82% feel more recognized",
      text: "Our users report feeling more valued and seen after just one week of using Gleam.",
    },
    {
      img: "/olena-bohovyk-DmeZC9riGkk-unsplash.jpg",
      title: "25% morale boost",
      text: "Companies saw improved team morale after introducing Gleam’s daily compliment ritual.",
    },
    {
      img: "/toa-heftiba-z9snuPiPKgQ-unsplash.jpg",
      title: "Positive Work Culture",
      text: "Gleam makes gratitude part of the culture—empowering people to lift each other up.",
    },
    {
      img: "/s-o-c-i-a-l-c-u-t--3jdwGuAEnk-unsplash.jpg",
      title: "Gratitude Drives Performance",
      text: "Employees who feel appreciated are more engaged, leading to stronger performance and retention.",
    },
  ];

  return (
    <section className="why-gleam-section container">
      <header className="feature-header">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          Why
        </motion.h2>
        <div className="feature-header-2">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            Gleam Works
          </motion.h2>
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <PiSmileyMeltingFill className="icon-features" />
          </motion.div>
        </div>
      </header>

      <div className="impact-cards-container">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            className="impact-card"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: idx * 0.25, // stagger effect
            }}
            viewport={{ once: false, amount: 0.3 }}
            whileHover={{
              rotate: 1.5,
              scale: 1.03,
              transition: { type: "spring", stiffness: 200, damping: 10 },
            }}
          >
            <motion.div
              className="img-component"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <Image
                src={card.img}
                alt={card.title}
                width={300}
                height={300}
                quality={100}
                className="impact-img"
              />
            </motion.div>
            <motion.div
              className="impact-overlay"
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

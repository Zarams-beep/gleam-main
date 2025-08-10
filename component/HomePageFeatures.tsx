"use client";
import "@/styles/HomePage.css";
import {
  FaSmile,
  FaClipboardList,
  FaCookie,
  FaPuzzlePiece,
} from "react-icons/fa";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  return (
    <div className="features-section container">
      {/* Header animation */}
      <motion.header
        className="feature-header"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.3 }}
      >
        <h2>What Makes</h2>
        <motion.div
          className="feature-header-2"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2>Gleam Special</h2>
          <motion.div
            initial={{ rotate: -45, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <PiSmileyMeltingFill className="icon-features" />
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Cards with unique animations */}
      <div className="features-container">
        <motion.div
          className="feature-card"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <FaSmile className="feature-icon" />
          <h3>Anonymous Daily Compliments</h3>
          <p>
            Send anonymous, uplifting messages to coworkers, promoting
            positivity across teams.
          </p>
        </motion.div>

        <motion.div
          className="feature-card"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <FaClipboardList className="feature-icon" />
          <h3>AI-powered Filter</h3>
          <p>
            Our AI filters bad words and ensures only kind and encouraging
            messages are shared.
          </p>
        </motion.div>

        <motion.div
          className="feature-card"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <FaCookie className="feature-icon" />
          <h3>Daily Fortune Cookie</h3>
          <p>
            Each day, get a random motivational fortune cookie to keep your team
            motivated and engaged.
          </p>
        </motion.div>

        <motion.div
          className="feature-card"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <FaPuzzlePiece className="feature-icon" />
          <h3>Grouped by Department</h3>
          <p>
            Compliments and messages are grouped by department, allowing for
            more personalized impact.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

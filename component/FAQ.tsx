"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/HomePage.css";
import { GoPlus } from "react-icons/go";
import { HiMiniMinus } from "react-icons/hi2";
import { PiSmileyMeltingFill } from "react-icons/pi";

const faqs = [
  {
    question: "How do I get started with Gleam?",
    answer:
      "Simply sign up your company on the platform, and you'll get access to your admin dashboard where you can manage employees and track engagement.",
  },
  {
    question: "How do I add employees?",
    answer:
      "Upload your employee database grouped by department/unit. This helps us personalize messages and ensure each team connects meaningfully.",
  },
  {
    question: "What do employees do daily?",
    answer:
      "Each day, employees are prompted to send an anonymous compliment or encouraging message to a coworker within their unit. It only takes a minute!",
  },
  {
    question: "How do you ensure messages are kind?",
    answer:
      "Our AI system filters out any inappropriate words or phrases to ensure only positive, uplifting content makes it through.",
  },
  {
    question: "What's the Fortune Cookie?",
    answer:
      'After sending a message, each employee receives a motivational "Fortune Cookie" — a bite-sized quote or insight to brighten their day.',
  },
  {
    question: "Can I see who sent the compliment?",
    answer:
      "Nope! All compliments are 100% anonymous to ensure sincerity and reduce bias. The goal is pure, positive vibes.",
  },
];

export default function FAQComponent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section container">
      <header className="feature-header">
        <h2>How Does</h2>
        <div className="feature-header-2">
          <h2>Gleam Works</h2>
          <PiSmileyMeltingFill className="icon-features" />
        </div>
      </header>

      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          className="faq-item"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <div
            className="faq-header-container"
            onClick={() => toggleFAQ(index)}
          >
            <h3>{faq.question}</h3>
            <span>
              {openIndex === index ? <HiMiniMinus /> : <GoPlus />}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {openIndex === index && (
              <motion.p
                className="faq-answer"
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {faq.answer}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

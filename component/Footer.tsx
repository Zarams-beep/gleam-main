"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaGooglePlusG,
} from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function FooterSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data: EmailFormData) => {
    setSubmitted(true);
    setTimeout(() => {
      reset();
    }, 500);
  };

  return (
    <motion.footer
      className="gleam-footer container"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="footer-top">
        {/* Brand */}
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="footer-title">
            Gleam <PiSmileyMeltingFill />
          </h3>
          <p className="footer-tagline">
            Thank you for being part of a brighter, kinder workplace movement. ✨
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          className="footer-contact"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <header>
            <h4 className="footer-subtitle">Stay in Touch</h4>
            <div className="quote-container">
              <p className="quote-text">
                “We didn’t just want to build software, we wanted to build a shift in culture.”
              </p>
              <p className="quote-author">— Chizaram, Founder of Gleam</p>
            </div>
          </header>
          <form className="newsletter-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="email-input-group">
              <input
                type="email"
                placeholder="Your email"
                className="email-input"
                {...register("email")}
              />
              <button type="submit" className="subscribe-button">
                Join
                <HiOutlineMail className="email-icon" />
              </button>
            </div>
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </form>

          {/* Social Icons */}
          <div className="footer-socials">
            {[
              { icon: <FaInstagram />, href: "#" },
              { icon: <FaTwitter />, href: "#" },
              { icon: <FaLinkedin />, href: "#" },
              { icon: <FaFacebook />, href: "#" },
              { icon: <FaGooglePlusG />, href: "#" },
            ].map((item, idx) => (
              <motion.a
                key={idx}
                href={item.href}
                className="social-icon"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          className="footer-links"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h4 className="footer-subtitle">Explore</h4>
          <ul className="link-list">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/features">Features</Link>
            </li>
            <li>
              <Link href="/how-it-works">How It Works</Link>
            </li>
            <li>
              <Link href="/story">Our Story</Link>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="footer-credit">
          Made with ❤️ by the Gleam team & community
        </p>
      </motion.div>
    </motion.footer>
  );
}

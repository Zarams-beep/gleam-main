// Footer.tsx
"use client";
import Link from "next/link";
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook, FaGooglePlusG} from "react-icons/fa";
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
    }, 500); // simulate refresh delay
  };

  return (
    <footer className="gleam-footer container2">
      <div className="footer-top">
        <div className="footer-brand">
          <h3 className="footer-title">
            Gleam <PiSmileyMeltingFill />
          </h3>
          <p className="footer-tagline">
            Thank you for being part of a brighter, kinder workplace movement. ✨
          </p>
        </div>

        <div className="footer-contact">
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
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </form>
          <div className="footer-socials">
           <button>
           <Link href="#">
              <FaInstagram className="social-icon" />
            </Link>
           </button>
            <button>
            <Link href="#">
              <FaTwitter className="social-icon" />
            </Link>
            </button>
            <button>
            <Link href="#">
              <FaLinkedin className="social-icon" />
            </Link>
            </button>
            <button>
            <Link href="#" className="social-icon">
                <FaFacebook className="social-icon"/>
            </Link>
            </button>
            <button>
            <Link href="#" className="social-icon">
                <FaGooglePlusG className="social-icon"/>
            </Link>
            </button>
          </div>
        </div>

        <div className="footer-links">
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
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-credit">Made with ❤️ by the Gleam team & community</p>
      </div>
    </footer>
  );
}

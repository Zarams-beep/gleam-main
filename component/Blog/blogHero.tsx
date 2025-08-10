"use client";

import { useState } from "react";
import Image from "next/image";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";
import BlogCategoryFilter from "@/component/Blog/blogCategory";
import CommentsSection from "@/component/Blog/blogComment";
import NewsletterStickyCTA from "@/component/Blog/blogNewletter";

const blogPosts = [
  {
    id: 1,
    title: "How Gleam Sparked Change in Remote Work Culture",
    excerpt:
      "Discover how our platform helped remote teams feel seen and appreciated...",
    image: "/kate-sade-c_NsMp-Z1Xk-unsplash.jpg",
    link: "/blog/gleam-remote-culture",
    date: "May 10, 2025",
  },
  {
    id: 2,
    title: "Why Employee Recognition Should Be Daily, Not Yearly",
    excerpt:
      "Learn why consistent appreciation trumps annual awards every time...",
    image: "/cristofer-maximilian-NSKP7Gwa_I0-unsplash.jpg",
    link: "/blog/daily-recognition",
    date: "May 8, 2025",
  },
  {
    id: 3,
    title: "Inside the Fortune Cookie Engine: AI Behind Gleam",
    excerpt: "A peek into the positive AI powering daily morale boosts...",
    image: "/marco-bianchetti-XrZN7UaePxc-unsplash.jpg",
    link: "/blog/fortune-cookie-ai",
    date: "May 6, 2025",
  },
  {
    id: 4,
    title: "Gleam's Origin Story: From Frustration to Innovation",
    excerpt:
      "Explore the personal journey that led to the creation of Gleam...",
    image: "/jerome-z-wS695XkKA-unsplash.jpg",
    link: "/blog/gleam-origin-story",
    date: "May 4, 2025",
  },
  {
    id: 5,
    title: "How Gleam Helps HR Teams Streamline Morale Boosting",
    excerpt:
      "HR managers are saving hours and building better teams with Gleam...",
    image: "/s-o-c-i-a-l-c-u-t--3jdwGuAEnk-unsplash.jpg",
    link: "/blog/hr-efficiency",
    date: "May 2, 2025",
  },
  {
    id: 6,
    title: "Remote But Connected: Gleam’s Role in Team Bonding",
    excerpt:
      "See how companies are using Gleam to nurture a strong team spirit remotely...",
    image: "/toa-heftiba-z9snuPiPKgQ-unsplash.jpg",
    link: "/blog/remote-connectedness",
    date: "April 30, 2025",
  },
  {
    id: 7,
    title: "AI + Empathy: The Design Behind Gleam's Daily Messages",
    excerpt:
      "Learn how we balance tech with heart in every Gleam message sent...",
    image: "/olena-bohovyk-DmeZC9riGkk-unsplash.jpg",
    link: "/blog/ai-empathy",
    date: "April 28, 2025",
  },
  {
    id: 8,
    title: "What Users Love Most About Gleam (Real Reviews)",
    excerpt:
      "Hear directly from users about their favorite Gleam features and why they matter...",
    image: "/thestandingdesk-yRjwn800N5A-unsplash.jpg",
    link: "/blog/user-feedback",
    date: "April 26, 2025",
  },
  {
    id: 9,
    title: "Building Positive Workplace Habits With Gleam",
    excerpt:
      "Discover how micro-recognition is transforming long-term employee behavior...",
    image: "/jason-leung-uhxiOmoVhOo-unsplash.jpg",
    link: "/blog/positive-habits",
    date: "April 24, 2025",
  },
  {
    id: 10,
    title: "From Burnout to Balance: How Gleam Uplifts Employees",
    excerpt:
      "A look into how daily encouragement is preventing burnout and boosting well-being...",
    image: "/muhammad-rizqi-N-lCdqdAdes-unsplash.jpg",
    link: "/blog/burnout-to-balance",
    date: "April 22, 2025",
  },
];

export default function BlogHeroSection() {
  const [activePost, setActivePost] = useState(blogPosts[0]);
  const otherPosts = blogPosts.filter((post) => post.id !== activePost.id);
  const isDesktop = useMediaQuery({ maxWidth: 768 });

  return (
    <section className="blog-hero-section">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="flex items-center gap-2">
          LATEST POST
          <PiSmileyMeltingFill />
        </h3>
      </motion.header>

      <div className="blog-hero-container">
        {/* Main Active Post */}
        <div className="main-featured-post">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePost.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              viewport={{ once: false, amount: 0.3 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="featured-post"
            >
              <motion.div
                className="featured-image"
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={activePost.image}
                  alt={activePost.title}
                  width={200}
                  height={200}
                  quality={100}
                />
              </motion.div>

              <motion.div
                className="featured-content"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="featured-title">{activePost.title}</h2>
                <p className="featured-excerpt">{activePost.excerpt}</p>
                <p>
                  <a href={activePost.link} className="read-more-link">
                    Read More →
                  </a>
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {!isDesktop ? <BlogCategoryFilter /> : null}
        </div>

        {/* Sidebar Posts */}
        <div className="sidebar-posts">
          {otherPosts.map((post, i) => (
            <motion.div
              key={post.id}
              className="sidebar-card"
              onClick={() => setActivePost(post)}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ scale: 1.03, backgroundColor: "#f9f9f9" }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="sidebar-post-img">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={100}
                  height={100}
                  quality={100}
                />
              </div>

              <div className="sidebar-text">
                <h4 className="sidebar-title">{post.title}</h4>
                <p className="sidebar-date">{post.date}</p>
              </div>
            </motion.div>
          ))}

          {!isDesktop ? (
            <div>
              <NewsletterStickyCTA />
              <CommentsSection />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

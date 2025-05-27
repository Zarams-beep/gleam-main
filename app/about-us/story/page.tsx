"use client";
import "@/styles/AboutPage.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types
type Year = "2020" | "2021" | "2022" | "2023" | "2024" | "2025";

type StoryEntry = {
  title: string;
  content: string;
};

const storyData: Record<Year, StoryEntry> = {
  "2020": {
    title: "The Spark",
    content: `Gleam didn’t start as a tech product. It started as a frustrated conversation over coffee. A coworker had been struggling for weeks burnt out, unappreciated, and invisible. Until one day, someone left an anonymous sticky note on their desk: “You’re doing amazing. Keep going.” That tiny message sparked a smile... and something bigger.

We realized that kindness in the workplace often goes unsaid. People appreciate each other quietly, but never share it. We asked ourselves: What if technology could help people say the good things they’re already thinking? That spark led to the birth of Gleam.`,
  },
  "2021": {
    title: "The First Steps",
    content: `We launched our MVP with a simple web interface for compliments. Early adopters loved it, but HR departments were skeptical. How do you moderate kindness? That's when we built in smart AI filters that kept messages safe and inclusive.

Despite a small budget, our first 500 users joined through word-of-mouth. We ran pilot programs, collected stories, and kept refining.`,
  },
  "2022": {
    title: "Growth & Grit",
    content: `2022 was our year of growth. We onboarded 15 companies across 3 countries. Feedback poured in—stories of shy employees opening up, recognition replacing rivalry, and people feeling truly seen.

But with growth came scaling challenges. We rebuilt our backend, added user analytics, and redesigned the UI for ease of use. It was messy, but worth it.`,
  },
  "2023": {
    title: "Recognition & Rebuild",
    content: `Gleam was featured in a workplace culture magazine. That shoutout doubled our users in 2 months. We took it as a sign to upgrade everything more powerful AI moderation, mobile-first design, and even our first brand video.

Still, we had to navigate burnout on our team. We used our own platform to remind ourselves why this mattered.`,
  },
  "2024": {
    title: "Culture, Global Reach, and Fortune Cookies",
    content: `We introduced Fortune Cookies: daily motivational messages personalized by role and tone. Our reach expanded to over 20,000 active users.

We also began conversations with larger organizations, onboarding a global retail chain that boosted Gleam into new time zones and cultures.`,
  },
  "2025": {
    title: "The Now & Next",
    content: `Today, Gleam is more than a compliment tool. It's a cultural shift. We’ve impacted over 80,000 employees across industries. Our next phase? Integration with Slack, Microsoft Teams, and deeper emotional analytics to understand how kindness drives performance.

And we’re just getting started.`,
  },
};

export default function FullStoryPage() {
  const [activeYear, setActiveYear] = useState<Year>("2020");

  return (
    <main className="story-page">

      <div className="story-page-2">
          {/* Title */}
          <section className="story-page-title">
            <h1>History</h1>
            <h2 className="">The Full Story Behind Gleam</h2>
            <p className="">
              From a simple compliment to a movement for kindness in the
              workplace.
            </p>
          </section>

          {/* Year Selector */}
          <div className="story-page-year">
            {(Object.keys(storyData) as Year[]).map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                aria-pressed={activeYear === year}
                className={` ${activeYear === year ? "story-active-year" : ""}`}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="story-motion-main">
            <div className="story-motion-main-2">
              {/* Animated Content */}
              <AnimatePresence mode="wait">
                <motion.section
                  key={activeYear}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="story-motion"
                >
                  <h2 className="">
                    {storyData[activeYear].title} ({activeYear})
                  </h2>
                  <p className="">{storyData[activeYear].content}</p>

                  <p className="">
                    Whether it’s a simple “You nailed it today” or “Thanks for
                    being there,” Gleam helps teams recognize the power of
                    positivity. Every compliment adds up. Every message matters.
                  </p>

                  <div className="story-motion-btn">
                    <button className="">
                      <Link href="/signup">Join the Movement →</Link>
                    </button>
                  </div>
                </motion.section>
              </AnimatePresence>
            </div>
          </div>
        </div>
    </main>
  );
}

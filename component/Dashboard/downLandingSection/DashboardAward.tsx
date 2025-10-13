"use client";

import React, { useState } from "react";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import { FaFireAlt } from "react-icons/fa";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

const awards = [
  {
    title: "Consistency Award",
    desc: "Logged in 7 days straight!",
    icon: <FaFireAlt className="text-[#a855f7] text-3xl" />,
    unlocked: true,
  },
  {
    title: "Top Compliment Giver",
    desc: "You sent 15 compliments this week.",
    icon: <FiMessageCircle className="text-[#7e22ce] text-3xl" />,
    unlocked: true,
  },
  {
    title: "Department Star",
    desc: "Best in Safety Department (Oct)",
    icon: <FiStar className="text-[#B794F4] text-3xl" />,
    unlocked: false,
  },
];

export default function DashboardAward() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="award-container">
      <header className="">
        <h2 className="">Achievements</h2>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className=""
        >
          {expanded ? (
            <>
              <IoMdArrowDropleft className="iconArrow" />
              <span className="">Hide</span>
            </>
          ) : (
            <>
              <span className="">Show</span>
              <IoMdArrowDropright className="iconArrow" />
            </>
          )}
        </button>
      </header>

      <div className="below-award-container">
        {awards.map((a, i) => (
          <div
            key={i}
            className={`below-award-sub-container ${
              a.unlocked ? "expanded" : "not-expanded"
            }`}
          >
            {/* ICON always visible */}
            <div className="mb-2">{a.icon}</div>

            {/* TITLE + DESC only visible when expanded */}
            <div
              className={`title-desc-container ${
                expanded ? "expanded-2" : "non-expanded-2"
              }`}
            >
              <h3 className="">
                {a.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

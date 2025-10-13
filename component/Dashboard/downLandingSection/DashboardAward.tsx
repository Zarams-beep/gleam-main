"use client";

import React, { useState } from "react";
import { VscStarHalf } from "react-icons/vsc";
import { PiFireFill } from "react-icons/pi";
import { TbMessageCircleFilled } from "react-icons/tb";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

const awards = [
  {
    title: "Consistency Award",
    desc: "Logged in 7 days straight!",
    icon: <PiFireFill className="fire-icon" />,
    unlocked: true,
  },
  {
    title: "Top Compliment Giver",
    desc: "You sent 15 compliments this week.",
    icon: <TbMessageCircleFilled className="message-icon" />,
    unlocked: true,
  },
  {
    title: "Department Star",
    desc: "Best in Safety Department (Oct)",
    icon: <VscStarHalf className="star-icon" />,
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
            <div className={`${expanded?'visible-expand':'not-visible-expand'}`}>{a.icon}</div>

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

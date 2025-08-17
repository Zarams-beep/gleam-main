// HowGleamWorks.tsx
import { FaUserPlus, FaSmile, FaRobot, FaCookieBite } from "react-icons/fa";
import { PiSmileyMeltingFill } from "react-icons/pi";

const steps = [
  {
    icon: <FaUserPlus className="works-icon" />,
    title: "Step 1: Company Joins",
    description: "Organizations sign up and upload their teams securely.",
  },
  {
    icon: <FaSmile className="works-icon" />,
    title: "Step 2: Compliment Sent",
    description: "Employees send anonymous praise across departments.",
  },
  {
    icon: <FaRobot className="works-icon" />,
    title: "Step 3: AI Filters It",
    description:
      "Smart moderation ensures messages stay positive and inclusive.",
  },
  {
    icon: <FaCookieBite className="works-icon" />,
    title: "Step 4: Daily Fortune Cookie",
    description:
      "Each employee gets a daily motivational message tailored to their role.",
  },
];

export default function HowGleamWorks() {
  return (
    <section className="how-works container">
      <header className="header-story-section">
        <h2 className="">
          How Gleam
          <span>
            Works
            <PiSmileyMeltingFill className="fill-melt" />
          </span>
        </h2>

        <h4 className="">
          Just a few simple steps to start spreading kindness.
        </h4>
      </header>
      <div className="how-works-content">
        {steps.map((step, index) => (
          <div key={index} className="how-works-content-2">
            <button>{step.icon}</button>
            <div className="small-work-content">
              <h3 className="">{step.title}</h3>
              <p className="">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import {
    FaMagic,
    FaShieldAlt,
    FaUsers,
    FaHandsHelping,
    FaEye,
    FaGlobe
  } from "react-icons/fa";  
  import { PiSmileyMeltingFill } from "react-icons/pi";

const values = [
  {
    icon: <FaHandsHelping className="about-core-icon" />,
    title: "Kindness First",
    description: "We believe small acts of kindness can spark big change.",
  },
  {
    icon: <FaShieldAlt className="about-core-icon" />,
    title: "Trust & Transparency",
    description: "Openness builds safe, meaningful workplaces.",
  },
  {
    icon: <FaUsers className="about-core-icon" />,
    title: "Everyone Matters",
    description: "Recognition isn’t for a few—it’s for every voice on the team.",
  },
  {
    icon: <FaEye className="about-core-icon" />,
    title: "Authenticity Always",
    description: "Genuine appreciation is what fuels real connection.",
  },
  {
    icon: <FaGlobe className="about-core-icon" />,
    title: "Inclusive by Design",
    description: "Every culture, every background, every personality—celebrated.",
  },
  {
    icon: <FaMagic className="about-core-icon" />,
    title: "Celebrate Progress",
    description: "Every step forward deserves to be seen—and shared.",
  },
];

export default function CoreValuesSection() {
  return (
    <section className="core-section container2">
         <header className="header-story-section">
              <h2 className="">
              The Heart 
                <span>of Gleam
                <PiSmileyMeltingFill className="fill-melt"/></span>
              </h2>
        
              <h4 className="">
              These values aren't just words, they're the heartbeat behind every message sent through Gleam.
              </h4>
              </header>

        <div className="core-content">
          {values.map((val, idx) => (
            <div
              key={idx}
              className="core-content-small"
            >
                {val.icon}
              <h3 className="">{val.title}</h3>
              <p className="">{val.description}</p>
            </div>
          ))}
      </div>
    </section>
  );
}

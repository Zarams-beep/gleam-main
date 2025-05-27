import "@/styles/HomePage.css";
import { FaSmile, FaClipboardList, FaCookie, FaPuzzlePiece } from "react-icons/fa";
import { PiSmileyMeltingFill } from "react-icons/pi";
export default function FeaturesSection() {
  return (
    <div className="features-section">
    <header className="feature-header">
  <h2 className="">What Makes</h2>
  <div className="feature-header-2">
    <h2 className="">Gleam Special</h2>
    <PiSmileyMeltingFill className="icon-features" />
  </div>
</header>


      <div className="features-container">
        <div className="feature-card animate-slide-in-left">
          <FaSmile className="feature-icon" />
          <h3>Anonymous Daily Compliments</h3>
          <p>Send anonymous, uplifting messages to coworkers, promoting positivity across teams.</p>
        </div>

        <div className="feature-card animate-slide-in-left">
          <FaClipboardList className="feature-icon" />
          <h3>AI-powered Filter</h3>
          <p>Our AI filters bad words and ensures only kind and encouraging messages are shared.</p>
        </div>

        <div className="feature-card animate-slide-in-right">
          <FaCookie className="feature-icon" />
          <h3>Daily Fortune Cookie</h3>
          <p>Each day, get a random motivational fortune cookie to keep your team motivated and engaged.</p>
        </div>

        <div className="feature-card animate-slide-in-right">
          <FaPuzzlePiece className="feature-icon" />
          <h3>Grouped by Department</h3>
          <p>Compliments and messages are grouped by department, allowing for more personalized impact.</p>
        </div>
      </div>
    </div>
  );
}

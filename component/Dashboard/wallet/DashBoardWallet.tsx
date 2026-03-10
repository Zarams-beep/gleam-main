"use client";
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { PiCoins } from "react-icons/pi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Props { value?: number; loading?: boolean; }

export default function DashBoardWallet1({ value, loading }: Props) {
  const progress = Math.min(100, value ?? 0);
  return (
    <div className="wallet-container wallet-container-1">
      <div className="wallet-card">
        <div className="wallet-header">
          <PiCoins className="coins" />
          <h2>Coins</h2>
        </div>
        <section className="wallet-second-part">
          <div className="wallet-balance">
            <MdOutlineKeyboardDoubleArrowUp className="wallet-arrow" />
            <span>{loading ? "—" : value ?? 0}</span>
          </div>
          <div style={{ width: 70, height: 70 }}>
            <CircularProgressbar value={progress} text={`${progress}%`}
              styles={buildStyles({ textSize: "20px", pathColor: "#464614", textColor: "#464614", trailColor: "#D6CFE6" })} />
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";
import { MdOutlineKeyboardDoubleArrowUp  } from "react-icons/md";
import { PiCoins } from "react-icons/pi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function DashBoardWallet1() {
  const progress = 58;

  return (
    <div className="wallet-container wallet-container-1">
      <div className="wallet-card">
        {/* Wallet Icon and Title */}
        <div className="wallet-header">
          <PiCoins className="coins"/>
          <h2 className="">Coins</h2>
        </div>

        {/* Second Part */}
        <section className="wallet-second-part">
          <div className="wallet-balance">
            <MdOutlineKeyboardDoubleArrowUp  className="wallet-arrow"/>
            <span>30</span>
          </div>

          {/* Circular Progress */}
          <div style={{ width: 70, height: 70 }}>
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
              styles={buildStyles({
                textSize: "20px",
                pathColor: "#464614",
                textColor: "#464614",
                trailColor: "#D6CFE6",
              })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

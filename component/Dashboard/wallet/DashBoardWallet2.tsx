"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaFire } from "react-icons/fa6";
export default function DashBoardWallet2() {
    const progress = 20;
    
      return (
        <div className="wallet-container wallet-container-2">
          <div className="wallet-card">
            {/* Wallet Icon and Title */}
            <div className="wallet-header">
              <FaFire className="streak"/>
              <h2 className="">Streak</h2>
            </div>
    
            {/* Second Part */}
            <section className="wallet-second-part">
              <div className="wallet-balance">
    
                <span>20 days</span>

              </div>
    
              {/* Circular Progress */}
              <div style={{ width: 70, height: 70 }}>
                <CircularProgressbar
                  value={progress}
                  text={`${progress}%`}
                  styles={buildStyles({
                    textSize: "20px",
                    pathColor: "#FFC107",
                    textColor: "#FFC107",
                    trailColor: "#D6CFE6",
                  })}
                />
              </div>
            </section>
          </div>
        </div>
      );
}
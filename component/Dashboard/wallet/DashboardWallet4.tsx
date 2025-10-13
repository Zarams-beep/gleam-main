"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { MdVolunteerActivism } from "react-icons/md";
export default function DashBoardWallet4() {
    const progress = 40;
    
      return (
        <div className="wallet-container wallet-container-4">
          <div className="wallet-card">
            {/* Wallet Icon and Title */}
            <div className="wallet-header">
              <MdVolunteerActivism className="performance"/>
              <h2 className="">Performance</h2>
            </div>
    
            {/* Second Part */}
            <section className="wallet-second-part">
              <div className="wallet-balance">
    <MdOutlineKeyboardDoubleArrowDown className="wallet-arrow"/>
                <span>40</span>

              </div>
    
              {/* Circular Progress */}
              <div style={{ width: 70, height: 70 }}>
                <CircularProgressbar
                  value={progress}
                  text={`${progress}%`}
                  styles={buildStyles({
                    textSize: "20px",
                    pathColor: "#EC407A",
                    textColor: "#EC407A",
                    trailColor: "#D6CFE6",
                  })}
                />
              </div>
            </section>
          </div>
        </div>
      );
}
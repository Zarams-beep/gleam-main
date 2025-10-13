"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaPeopleRoof } from "react-icons/fa6";
import { MdOutlineKeyboardDoubleArrowUp  } from "react-icons/md";
export default function DashBoardWallet3(){
    const progress = 100;
return (
        <div className="wallet-container wallet-container-3">
          <div className="wallet-card">
            {/* Wallet Icon and Title */}
            <div className="wallet-header">
              <FaPeopleRoof className="people"/>
              <h2 className="">Employees</h2>
            </div>
    
            {/* Second Part */}
            <section className="wallet-second-part">
              <div className="wallet-balance">
                <MdOutlineKeyboardDoubleArrowUp  className="wallet-arrow"/>
                <span>100</span>

              </div>
    
              {/* Circular Progress */}
              <div style={{ width: 70, height: 70 }}>
                <CircularProgressbar
                  value={progress}
                  text={`${progress}%`}
                  styles={buildStyles({
                    textSize: "20px",
                    pathColor: "#2196F3",
                    textColor: "#2196F3",
                    trailColor: "#D6CFE6",
                  })}
                />
              </div>
            </section>
          </div>
        </div>
      );
}
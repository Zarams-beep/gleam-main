// component/Dashboard/wallet/WalletCard.tsx
// ─── Single configurable wallet card — replaces all 4 separate wallet files ──
"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { MdOutlineKeyboardDoubleArrowUp, MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { motion } from "framer-motion";

interface WalletCardProps {
  label: string;
  /** Raw value to display (number or pre-formatted string like "20 days") */
  value?: number | string;
  /** 0–100 for the circular progress ring */
  progress?: number;
  loading?: boolean;
  icon: React.ReactNode;
  pathColor: string;
  textColor: string;
  containerClass?: string;
  /** "up" shows an up arrow, "down" a down arrow, undefined shows nothing */
  direction?: "up" | "down";
  /** Optional unit appended after the value e.g. "days" */
  unit?: string;
}

export default function WalletCard({
  label,
  value,
  progress,
  loading,
  icon,
  pathColor,
  textColor,
  containerClass = "",
  direction,
  unit,
}: WalletCardProps) {
  const displayValue = loading ? "—" : value ?? 0;
  const displayProgress = Math.round(Math.min(100, progress ?? (typeof value === "number" ? value : 0)));

  return (
    <motion.div
      className={`wallet-container ${containerClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="wallet-card">
        <div className="wallet-header">
          {icon}
          <h2>{label}</h2>
        </div>

        <section className="wallet-second-part">
          <div className="wallet-balance">
            {direction === "up" && (
              <MdOutlineKeyboardDoubleArrowUp className="wallet-arrow" />
            )}
            {direction === "down" && (
              <MdOutlineKeyboardDoubleArrowDown className="wallet-arrow" />
            )}
            <span>
              {loading ? "—" : `${displayValue}${unit ? ` ${unit}` : ""}`}
            </span>
          </div>

          <div style={{ width: 70, height: 70 }}>
            {loading ? (
              <div className="wallet-progress-skeleton" />
            ) : (
              <CircularProgressbar
                value={displayProgress}
                text={`${displayProgress}%`}
                styles={buildStyles({
                  textSize: "20px",
                  pathColor,
                  textColor,
                  trailColor: "#D6CFE6",
                })}
              />
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

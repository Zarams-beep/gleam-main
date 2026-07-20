// component/Dashboard/TrialBillingNotice.tsx
"use client";
import { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { orgApi } from "@/utils/api";

type BillingInfo = {
  plan: string;
  trialEndsAt: string | null;
  bank: { bankName: string; accountName: string; accountNumber: string; routingCode: string | null };
};

const daysRemaining = (iso: string | null) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// Persistent (not dismissible) reminder card for the dashboard home page —
// shown only during an active free trial. The expired/grace-period state
// already takes over the whole dashboard via app/dashboard/layout.tsx's
// full-screen paywall, so this only needs to handle the "still on trial"
// case: making sure payment isn't a surprise once the trial actually ends.
export default function TrialBillingNotice() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    orgApi.billing().then((r: any) => setBilling(r)).catch(() => {
      // No org yet, or request failed — just don't show the card.
    });
  }, []);

  if (!billing || billing.plan !== "trial") return null;
  const daysLeft = daysRemaining(billing.trialEndsAt);
  if (daysLeft === null) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #fffbeb, #fef9ec)",
      border: "1.5px solid #fde68a", borderRadius: 18,
      padding: "1.1rem 1.4rem", marginBottom: "1.25rem",
      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: "#fde68a",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: "1.05rem", color: "#92400e",
      }}>
        <FaRegClock />
      </div>

      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ margin: 0, fontWeight: 800, color: "#92400e", fontSize: "0.92rem", fontFamily: "'Sora', sans-serif" }}>
          {daysLeft === 0 ? "Your free trial ends today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your free trial`}
        </p>
        <p style={{ margin: "3px 0 0", color: "#b45309", fontSize: "0.8rem" }}>
          You'll need to pay by bank transfer to keep full access — messaging &amp; calls stay on either way.
        </p>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: "#92400e", color: "#fff", border: "none", borderRadius: 10,
          padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
          whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {expanded ? "Hide payment details" : "View payment details"}
      </button>

      {expanded && billing.bank && (
        <div style={{ width: "100%", background: "#fff", border: "1px solid #fde68a", borderRadius: 12, padding: "0.9rem 1.1rem" }}>
          {[
            ["Bank", billing.bank.bankName],
            ["Account name", billing.bank.accountName],
            ["Account number", billing.bank.accountNumber],
            ...(billing.bank.routingCode ? [["Routing / IFSC / SWIFT", billing.bank.routingCode]] : []),
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "0.83rem" }}>
              <span style={{ color: "#9ca3af" }}>{label}</span>
              <span style={{ fontWeight: 700, color: "#374151" }}>{value}</span>
            </div>
          ))}
          <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
            Payments made after 10pm are approved the next day.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DashboardNavBarPage from "@/component/Dashboard/DashBoardNavBar";
import DashboardSidebar from "@/component/Dashboard/DashBoardSideBar";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/userSlice";
import { authApi, orgApi } from "@/utils/api";
import { SocketProvider } from "@/context/SocketContext";
import { CallProvider } from "@/context/CallContext";
import CallModal from "@/component/Dashboard/DashboardMessage/CallModal";

// GET /api/org/me returns the raw organizations row (snake_case, straight off
// the DB) — see gleam-backend/controllers/orgController.js getOrg. Only the
// two trial-gating columns are needed here.
type OrgPlanStatus = {
  plan: "trial" | "active" | "expired" | "canceled";
  trial_ends_at: string | null;
};

type BillingInfo = {
  plan: string;
  trialEndsAt: string | null;
  gracePeriodEndsAt: string | null;
  bank: { bankName: string; accountName: string; accountNumber: string; routingCode: string | null };
  latestSubmission: { status: "pending" | "approved" | "rejected"; note: string; createdAt: string; reviewedAt: string | null } | null;
};

const daysRemaining = (iso: string | null) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// Re-checks the org's plan every 60s (not just once on mount) so a trial that
// lapses *while the dashboard is already open* still gets pulled into the
// full-screen paywall promptly, instead of only on the next hard navigation.
const PLAN_POLL_MS = 60_000;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const synced    = useRef(false); // prevent double-fetch
  const [orgPlan, setOrgPlan]     = useState<OrgPlanStatus | null>(null);
  const [billing, setBilling]     = useState<BillingInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [markPaidNote, setMarkPaidNote]     = useState("");
  const [markPaidBusy, setMarkPaidBusy]     = useState(false);
  const [markPaidError, setMarkPaidError]   = useState<string | null>(null);
  const [markPaidJustSubmitted, setMarkPaidJustSubmitted] = useState(false);

  // Auth protection
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // The jwt callback in lib/auth.ts flags session.error = "RefreshAccessTokenError"
  // when the 15-minute access token couldn't be silently refreshed (expired
  // refresh token, backend rejected it, etc). Rather than let every dashboard
  // widget's API call start failing with a raw auth error, sign the user out
  // cleanly and send them back to log in.
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login?reason=session_expired" });
    }
  }, [session]);

  // ✅ Every time the dashboard loads, re-fetch /me with the current token
  // This guarantees the correct name/role/orgId is shown — never stale persist data
  useEffect(() => {
    if (status !== "authenticated" || !session?.user || synced.current) return;
    const u = session.user as any;

    synced.current = true;
    // authApi.me() goes through the proxy, which attaches the token from the
    // server-side NextAuth session — no client-held token needed here.
    authApi.me().then((meRes: any) => {
      if (!meRes?.user) return;
      dispatch(setCredentials({
        user: {
          id:         meRes.user.id,
          fullName:   meRes.user.fullName  || u.name || "",
          email:      meRes.user.email     || u.email || "",
          image:      meRes.user.image     ?? u.image ?? null,
          orgType:    meRes.user.orgType   ?? null,
          orgId:      meRes.user.orgId     ?? null,
          department: meRes.user.department ?? null,
          role:       meRes.user.role      ?? "member",
          stats: {
            coins:         meRes.user.stats?.coins         ?? 0,
            streak:        meRes.user.stats?.streak        ?? 0,
            performance:   meRes.user.stats?.performance   ?? 0,
            totalSent:     meRes.user.stats?.totalSent     ?? 0,
            totalReceived: meRes.user.stats?.totalReceived ?? 0,
          },
        },
      }));
    }).catch(() => {
      // /me failed — keep whatever is in Redux already
    });
  }, [status, session, dispatch]);

  // Trial/plan gate — a lightweight, separate fetch from the user sync above
  // so a billing hiccup can never block the user-profile fetch (and vice
  // versa). 404 (no org yet) is expected and simply leaves orgPlan as null,
  // which renders the dashboard normally — the org-creation/join flows are
  // never gated. Polled (not just fetched once) so a trial that lapses while
  // the tab is already open still gets caught within a minute.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    const fetchPlan = () => {
      orgApi.me().then((r: any) => {
        if (cancelled) return;
        if (r?.org) setOrgPlan({ plan: r.org.plan ?? "trial", trial_ends_at: r.org.trial_ends_at ?? null });
      }).catch(() => {
        // No org yet, or request failed — fail open, dashboard renders normally.
      });
    };

    fetchPlan();
    const interval = setInterval(fetchPlan, PLAN_POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [status]);

  const trialExpired = orgPlan?.plan === "expired" || orgPlan?.plan === "canceled";

  // Fetch bank-transfer details + any existing payment claim once the org
  // actually hits the paywall — no point loading this for everyone else.
  useEffect(() => {
    if (!trialExpired) { setBilling(null); return; }
    let cancelled = false;
    setBillingLoading(true);
    orgApi.billing().then((r: any) => {
      if (!cancelled) setBilling(r);
    }).catch(() => {
      // Billing info failing to load shouldn't crash the paywall — it just
      // renders without bank details until a retry succeeds.
    }).finally(() => { if (!cancelled) setBillingLoading(false); });
    return () => { cancelled = true; };
  }, [trialExpired]);

  const handleMarkPaid = async () => {
    setMarkPaidBusy(true);
    setMarkPaidError(null);
    try {
      await orgApi.markPaid(markPaidNote);
      setMarkPaidJustSubmitted(true);
      const r = await orgApi.billing();
      setBilling(r);
    } catch (err: any) {
      setMarkPaidError(err.message || "Something went wrong submitting your payment notice.");
    } finally {
      setMarkPaidBusy(false);
    }
  };

  if (status === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "#f9fafb", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #ede9fe", borderTopColor: "#5b50e8", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!session) return null;

  const trialDaysLeft = orgPlan?.plan === "trial" ? daysRemaining(orgPlan.trial_ends_at) : null;
  const graceDaysLeft = billing?.gracePeriodEndsAt ? daysRemaining(billing.gracePeriodEndsAt) : null;
  const submission = billing?.latestSubmission ?? null;
  const hasPendingSubmission = submission?.status === "pending";

  // Trial's over — replace the entire dashboard with a full-screen paywall.
  // No payment gateway is wired up — this is the manual bank-transfer flow:
  // show the account to pay into, let the admin flag "I've paid", and the
  // site owner approves it by email (see gleam-backend/controllers/
  // billingController.js). Approval flips the org straight back to active.
  if (trialExpired) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #1a1740 0%, #2e2a6e 50%, #3d37a8 100%)",
        fontFamily: "'DM Sans', sans-serif", padding: "2rem",
      }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "2.75rem 2.5rem",
          maxWidth: 460, width: "100%", textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 18px",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
          }}>
            🔒
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#1a1740", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Your free trial has ended
          </h1>
          <p style={{ color: "#7b77a8", fontSize: "0.92rem", lineHeight: 1.7, margin: "0 0 20px" }}>
            Your organisation's free trial is over, so everyone is signed out of the dashboard until payment is confirmed.
            {graceDaysLeft !== null && (
              <> Your data is safe for now — you have <strong>{graceDaysLeft} day{graceDaysLeft === 1 ? "" : "s"}</strong> left before it's permanently deleted.</>
            )}
          </p>

          {billingLoading && !billing ? (
            <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "0 0 20px" }}>Loading payment details...</p>
          ) : billing ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "1.1rem 1.25rem", marginBottom: 18, textAlign: "left" }}>
              <p style={{ fontWeight: 700, color: "#1a1740", fontSize: "0.85rem", margin: "0 0 10px" }}>Pay by bank transfer</p>
              {[
                ["Bank", billing.bank.bankName],
                ["Account name", billing.bank.accountName],
                ["Account number", billing.bank.accountNumber],
                ...(billing.bank.routingCode ? [["Routing / IFSC / SWIFT", billing.bank.routingCode]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "0.85rem" }}>
                  <span style={{ color: "#94a3b8" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#374151" }}>{value}</span>
                </div>
              ))}
            </div>
          ) : null}

          <p style={{ color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.6, margin: "0 0 16px" }}>
            Note: payments made after 10pm will be approved the next day.
          </p>

          {hasPendingSubmission || markPaidJustSubmitted ? (
            <div style={{
              background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 14,
              padding: "0.9rem 1.1rem", color: "#1d4ed8", fontSize: "0.88rem", fontWeight: 600, marginBottom: 14,
            }}>
              Thanks! Your payment will reflect once it's confirmed — we'll email you the moment it's approved.
            </div>
          ) : (
            <>
              {submission?.status === "rejected" && (
                <div style={{
                  background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 14,
                  padding: "0.8rem 1rem", color: "#b91c1c", fontSize: "0.82rem", fontWeight: 600, marginBottom: 12, textAlign: "left",
                }}>
                  Your last payment notice couldn't be confirmed. Double-check the transfer, then submit again below.
                </div>
              )}
              <textarea
                value={markPaidNote}
                onChange={(e) => setMarkPaidNote(e.target.value)}
                placeholder="Optional note (e.g. amount sent, reference number)"
                rows={2}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "0.6rem 0.75rem", marginBottom: 10,
                  borderRadius: 10, border: "1.5px solid #e4e2f8", fontFamily: "inherit", fontSize: "0.85rem", resize: "vertical",
                }}
              />
              {markPaidError && (
                <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0 0 10px", fontWeight: 600 }}>{markPaidError}</p>
              )}
              <button
                onClick={handleMarkPaid}
                disabled={markPaidBusy}
                style={{
                  width: "100%", padding: "0.9rem", marginBottom: 12,
                  background: "linear-gradient(135deg, #5b50e8, #7c6ef5)", color: "#fff",
                  border: "none", borderRadius: 14, fontWeight: 700, fontSize: "0.95rem",
                  fontFamily: "'Sora', sans-serif", cursor: markPaidBusy ? "not-allowed" : "pointer",
                  opacity: markPaidBusy ? 0.7 : 1,
                  boxShadow: "0 4px 20px rgba(91,80,232,0.30)",
                }}
              >
                {markPaidBusy ? "Submitting..." : "I've made this payment"}
              </button>
            </>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              width: "100%", padding: "0.75rem", background: "none",
              border: "1.5px solid #e4e2f8", borderRadius: 14,
              color: "#7b77a8", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <CallProvider>
        <div className="dashboard-main-container">
          <DashboardSidebar />
          <div className="dashboard-main-container-2">
            <DashboardNavBarPage />
            {trialDaysLeft !== null && (
              <div style={{
                background: trialDaysLeft <= 5 ? "#fef3c7" : "#f0edff",
                color: trialDaysLeft <= 5 ? "#92400e" : "#5b50e8",
                textAlign: "center", fontSize: "0.82rem", fontWeight: 600,
                padding: "0.5rem 1rem", fontFamily: "'DM Sans', sans-serif",
              }}>
                {trialDaysLeft === 0
                  ? "Your free trial ends today."
                  : `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free trial.`}
              </div>
            )}
            <div className="dashboard-content">
              {children}
            </div>
          </div>
        </div>
        <CallModal />
      </CallProvider>
    </SocketProvider>
  );
}

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

const daysRemaining = (iso: string | null) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const synced    = useRef(false); // prevent double-fetch
  const orgSynced = useRef(false);
  const [orgPlan, setOrgPlan]     = useState<OrgPlanStatus | null>(null);
  const [upgradeClicked, setUpgradeClicked] = useState(false);

  // Auth protection
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

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
  // never gated.
  useEffect(() => {
    if (status !== "authenticated" || orgSynced.current) return;
    orgSynced.current = true;
    orgApi.me().then((r: any) => {
      if (r?.org) setOrgPlan({ plan: r.org.plan ?? "trial", trial_ends_at: r.org.trial_ends_at ?? null });
    }).catch(() => {
      // No org yet, or request failed — fail open, dashboard renders normally.
    });
  }, [status]);

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

  const trialExpired = orgPlan?.plan === "expired" || orgPlan?.plan === "canceled";
  const trialDaysLeft = orgPlan?.plan === "trial" ? daysRemaining(orgPlan.trial_ends_at) : null;

  // Trial's over — replace the entire dashboard with a full-screen paywall.
  // No payment gateway is wired up yet, so "Upgrade" is a stub for now; the
  // gate itself (and everything it protects) needs zero gateway integration.
  if (trialExpired) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #1a1740 0%, #2e2a6e 50%, #3d37a8 100%)",
        fontFamily: "'DM Sans', sans-serif", padding: "2rem",
      }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "2.75rem 2.5rem",
          maxWidth: 440, width: "100%", textAlign: "center",
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
          <p style={{ color: "#7b77a8", fontSize: "0.92rem", lineHeight: 1.7, margin: "0 0 24px" }}>
            Your organisation's 30-day trial is over. Upgrade to keep sending compliments, chatting, and calling your teammates.
          </p>

          {upgradeClicked ? (
            <div style={{
              background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14,
              padding: "0.9rem 1.1rem", color: "#166534", fontSize: "0.88rem", fontWeight: 600, marginBottom: 14,
            }}>
              Thanks! We've noted your interest — reach out to your admin or our team to activate billing.
            </div>
          ) : (
            <button
              onClick={() => setUpgradeClicked(true)}
              style={{
                width: "100%", padding: "0.9rem", marginBottom: 12,
                background: "linear-gradient(135deg, #5b50e8, #7c6ef5)", color: "#fff",
                border: "none", borderRadius: 14, fontWeight: 700, fontSize: "0.95rem",
                fontFamily: "'Sora', sans-serif", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(91,80,232,0.30)",
              }}
            >
              Upgrade Plan
            </button>
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

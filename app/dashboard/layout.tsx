"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import DashboardNavBarPage from "@/component/Dashboard/DashBoardNavBar";
import DashboardSidebar from "@/component/Dashboard/DashBoardSideBar";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/userSlice";
import { authApi } from "@/utils/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const synced   = useRef(false); // prevent double-fetch

  // Auth protection
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // ✅ Every time the dashboard loads, re-fetch /me with the current token
  // This guarantees the correct name/role/orgId is shown — never stale persist data
  useEffect(() => {
    if (status !== "authenticated" || !session?.user || synced.current) return;
    const u = session.user as any;
    const token = u.accessToken || localStorage.getItem("gleam_access_token");
    if (!token) return;

    synced.current = true;
    authApi.me(token).then((meRes: any) => {
      if (!meRes?.user) return;
      dispatch(setCredentials({
        token,
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

  if (status === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f9fafb", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #ede9fe", borderTopColor: "#5b50e8", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!session) return null;

  return (
    <div className="dashboard-main-container">
      <DashboardSidebar />
      <div className="dashboard-main-container-2">
        <DashboardNavBarPage />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}

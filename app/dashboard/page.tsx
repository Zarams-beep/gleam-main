// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { PiCoins } from "react-icons/pi";
import { FaFire } from "react-icons/fa6";
import { FaPeopleRoof } from "react-icons/fa6";
import { MdVolunteerActivism } from "react-icons/md";
import StreakPieChart from "@/component/Dashboard/DashboardChart2";
import PerformanceChart from "@/component/Dashboard/DashBoardChart1";
import DashBoardHeader from "@/component/Dashboard/DashBoardHeader";
import GleamDashboardSections from "@/component/Dashboard/downLandingSection/OtherLanding";
import WalletCard from "@/component/Dashboard/wallet/WalletCard";
import { statsApi } from "@/utils/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStats } from "@/store/slices/statsSlice";
import { UserStats } from "@/types/auth";

// How long before we consider cached stats stale (matches backend Redis TTL)
const STATS_STALE_MS = 60_000;

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { stats: cachedStats, lastFetched } = useAppSelector((s) => s.stats);
  const [stats, setLocalStats] = useState<UserStats | null>(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);

  useEffect(() => {
    //  Skip fetch if we have fresh data in Redux (avoids hammering the API)
    const isFresh = lastFetched && Date.now() - lastFetched < STATS_STALE_MS;
    if (cachedStats && isFresh) {
      setLocalStats(cachedStats);
      setLoading(false);
      return;
    }

    setLoading(true);
    statsApi
      .me()
      .then(({ stats }) => {
        setLocalStats(stats);
        dispatch(setStats(stats));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);   // run once on mount — cache logic above handles staleness

  return (
    <div style={{ padding: "1.75rem", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="home-container">
        <DashBoardHeader />

        {/* ── Wallet Cards — all driven by real stats ── */}
        <div className="wallet-arrange-container">
          <WalletCard
            label="Coins"
            value={stats?.coins}
            progress={Math.min(100, stats?.coins ?? 0)}
            loading={loading}
            icon={<PiCoins className="coins" />}
            pathColor="#464614"
            textColor="#464614"
            containerClass="wallet-container-1"
            direction="up"
          />
          <WalletCard
            label="Streak"
            value={stats?.streak}
            progress={Math.min(100, ((stats?.streak ?? 0) / 30) * 100)}
            loading={loading}
            icon={<FaFire className="streak" />}
            pathColor="#FFC107"
            textColor="#FFC107"
            containerClass="wallet-container-2"
            unit="days"
          />
          <WalletCard
            label="Sent"
            value={stats?.totalSent}
            progress={Math.min(100, stats?.totalSent ?? 0)}
            loading={loading}
            icon={<FaPeopleRoof className="people" />}
            pathColor="#2196F3"
            textColor="#2196F3"
            containerClass="wallet-container-3"
            direction="up"
          />
          <WalletCard
            label="Performance"
            value={stats?.performance}
            progress={Math.min(100, stats?.performance ?? 0)}
            loading={loading}
            icon={<MdVolunteerActivism className="performance" />}
            pathColor="#EC407A"
            textColor="#EC407A"
            containerClass="wallet-container-4"
            direction={
              (stats?.performance ?? 0) >= 50 ? "up" : "down"
            }
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
          <div className="chart-container">
            <PerformanceChart />
            <StreakPieChart streak={stats?.streak} coins={stats?.coins} loading={loading} />
          </div>
          <GleamDashboardSections stats={stats} loading={loading} />
        </div>
      </div>
    </div>
  );
}

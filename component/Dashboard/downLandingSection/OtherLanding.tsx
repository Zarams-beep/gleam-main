// component/Dashboard/downLandingSection/OtherLanding.tsx
"use client";
import { UserStats } from "@/types/auth";
import DashboardActivity from "./DashboardActivity";
import DashboardAward from "./DashboardAward";
import DashboardLeaderboard from "./DashboardLeaderboard";

interface Props {
  stats?: UserStats | null;
  loading?: boolean;
}

export default function GleamDashboardSections({ stats, loading }: Props) {
  return (
    <div className="dashoard-sub-below-section">
      <DashboardLeaderboard />
      <DashboardAward />
      <DashboardActivity stats={stats} loading={loading} />
    </div>
  );
}

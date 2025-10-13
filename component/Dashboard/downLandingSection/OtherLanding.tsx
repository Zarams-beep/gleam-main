"use client";

import DashboardAward from "./DashboardAward";
import DashboardLeaderboard from "./DashboardLeaderboard";

export default function GleamDashboardSections() {
  return (
    <div className="dashboard-below-section">
<div className="dashoard-sub-below-section">
  <DashboardAward/>
  <DashboardLeaderboard/>
</div>
    </div>
  );
}

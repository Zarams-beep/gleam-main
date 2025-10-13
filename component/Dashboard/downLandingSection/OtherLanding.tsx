"use client";

import DashboardActivity from "./DashboardActivity";
import DashboardAward from "./DashboardAward";
import DashboardLeaderboard from "./DashboardLeaderboard";

export default function GleamDashboardSections() {
  return (
    <div className="dashboard-below-section">
<div className="dashoard-sub-below-section">
  <DashboardLeaderboard/>
  <DashboardAward/>
  <DashboardActivity/>
</div>
    </div>
  );
}

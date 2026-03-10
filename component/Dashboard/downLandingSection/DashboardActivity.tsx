// component/Dashboard/downLandingSection/DashboardActivity.tsx
// ─── Driven by real stats from the backend via props ─────────────────────────
"use client";
import { UserStats } from "@/types/auth";

interface Props {
  stats?: UserStats | null;
  loading?: boolean;
}

export default function DashboardActivity({ stats, loading }: Props) {
  const summary = [
    { type: "Compliments Sent",     value: stats?.totalSent          ?? 0 },
    { type: "Compliments Received", value: stats?.totalReceived       ?? 0 },
    { type: "Active Days",          value: stats?.activeDaysThisMonth ?? 0 },
    { type: "Current Streak",       value: `${stats?.streak ?? 0} days` },
  ];

  return (
    <div className="dashboard-activity-summary">
      <h2>Activity Summary</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, i) => (
              <tr key={i}>
                <td>{item.type}</td>
                <td className="item-value">
                  {loading ? (
                    <span className="skeleton-inline" />
                  ) : (
                    item.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

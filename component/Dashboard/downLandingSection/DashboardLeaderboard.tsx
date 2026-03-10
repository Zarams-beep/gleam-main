// component/Dashboard/downLandingSection/DashboardLeaderboard.tsx
// ─── Fetches real leaderboard from GET /api/leaderboard ──────────────────────
"use client";
import { useState, useEffect } from "react";
import { FiRefreshCcw, FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { leaderboardApi } from "@/utils/api";
import { LeaderboardEntry } from "@/types/auth";

const ITEMS_PER_PAGE = 5;

export default function DashboardLeaderboard() {
  const [data, setData]       = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await leaderboardApi.individual();
      setData(res.leaderboard ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const filtered = data.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start      = (page - 1) * ITEMS_PER_PAGE;
  const paginated  = filtered.slice(start, start + ITEMS_PER_PAGE);

  const rankLabel = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="leadership-container">
      <header>
        <h2>Team Highlights</h2>

        <div className="leadership-controls">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search name or dept..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <button onClick={fetchLeaderboard} disabled={loading}>
            <FiRefreshCcw />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      {error && <p className="text-sm text-red-500 text-center py-2">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Department</th>
              <th>Compliments</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j}><span className="skeleton-inline" /></td>
                    ))}
                  </tr>
                ))
              : paginated.map((user) => (
                  <tr key={user.userId} className={user.isCurrentUser ? "current-user-row" : ""}>
                    <td className="rank">{rankLabel(user.rank)}</td>
                    <td className="name">
                      {user.fullName}
                      {user.isCurrentUser && (
                        <span className="you-badge"> (you)</span>
                      )}
                    </td>
                    <td className="dept">{user.department ?? "—"}</td>
                    <td className="points">{user.complimentsSent}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
            <FiChevronLeft /> Prev
          </button>
          <span>{page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

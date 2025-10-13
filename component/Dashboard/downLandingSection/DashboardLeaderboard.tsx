"use client";

import React, { useState } from "react";
import { FiRefreshCcw, FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

const leaderboardData = [
  { rank: 1, name: "Amara", dept: "Safety", compliments: 35 },
  { rank: 2, name: "Chizaram", dept: "IT", compliments: 28 },
  { rank: 3, name: "Femi", dept: "Design", compliments: 25 },
  { rank: 4, name: "Tunde", dept: "HR", compliments: 22 },
  { rank: 5, name: "Ngozi", dept: "Admin", compliments: 21 },
  { rank: 6, name: "Emeka", dept: "Finance", compliments: 20 },
  { rank: 7, name: "Bisi", dept: "Marketing", compliments: 19 },
  { rank: 8, name: "Sade", dept: "Safety", compliments: 18 },
  { rank: 9, name: "Ifeanyi", dept: "IT", compliments: 17 },
  { rank: 10, name: "Halima", dept: "Design", compliments: 16 },
  { rank: 11, name: "Kunle", dept: "Admin", compliments: 15 },
  { rank: 12, name: "Damilola", dept: "Finance", compliments: 14 },
  { rank: 13, name: "Zainab", dept: "Marketing", compliments: 13 },
  { rank: 14, name: "Ola", dept: "HR", compliments: 12 },
  { rank: 15, name: "Chidi", dept: "Safety", compliments: 11 },
  { rank: 16, name: "Funmi", dept: "Design", compliments: 10 },
  { rank: 17, name: "Tomiwa", dept: "IT", compliments: 9 },
  { rank: 18, name: "Ada", dept: "Finance", compliments: 8 },
  { rank: 19, name: "Gbenga", dept: "Admin", compliments: 7 },
  { rank: 20, name: "Musa", dept: "Marketing", compliments: 6 },
];

export default function DashboardLeaderboard() {
  const [data, setData] = useState(leaderboardData);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const itemsPerPage = 5;

  // Filtered data based on search
  const filtered = data.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.dept.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = filtered.slice(start, end);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Shuffle / Refresh
  const shuffleData = () => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setData(shuffled);
    setPage(1);
  };

  return (
    <div className="leadership-container">
      <header className="">
        <h2 className="">Team Highlights</h2>

        <div className="leadership-controls">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search name or dept..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className=""
            />
          </div>

          <button
            onClick={shuffleData}
            className=""
          >
            <FiRefreshCcw />
            Refresh
          </button>
        </div>
      </header>

      <div className="table-container">
        <table className="">
          <thead>
            <tr className="">
              <th className="">Rank</th>
              <th className="">Name</th>
              <th className="">Department</th>
              <th className=" rounded-tr-lg">Compliments</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user, i) => (
              <tr key={i} className="">
                <td className="rank">
                  {user.rank}
                </td>
                <td className="name">{user.name}</td>
                <td className="dept">{user.dept}</td>
                <td className="points">
                  {user.compliments}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={` ${
            page === 1
              ? ""
              : ""
          }`}
        >
          <FiChevronLeft /> Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={` ${
            page === totalPages
              ? ""
              : ""
          }`}
        >
          Next <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

const leaderboard = [
  { rank: 1, name: "Amara", dept: "Safety", compliments: 35 },
  { rank: 2, name: "Chizaram", dept: "IT", compliments: 28 },
  { rank: 3, name: "Femi", dept: "Design", compliments: 25 },
];

export default function DashboardLeaderboard() {
    return(
        <div className="">
            <section>
        <h2 className="text-lg font-semibold mb-4 text-[#1A1023]">🏅 Team Highlights</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="px-4 py-2 rounded-tl-lg">Rank</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2 rounded-tr-lg">Compliments</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold text-[#a855f7]">{user.rank}</td>
                  <td className="px-4 py-2 text-gray-700">{user.name}</td>
                  <td className="px-4 py-2 text-gray-500">{user.dept}</td>
                  <td className="px-4 py-2 font-medium text-[#7e22ce]">{user.compliments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </div>
    )
}
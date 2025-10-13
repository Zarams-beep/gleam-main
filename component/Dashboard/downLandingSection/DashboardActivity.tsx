const summary = [
  { type: "Compliments Sent", value: 15 },
  { type: "Compliments Received", value: 9 },
  { type: "Active Days", value: 6 },
  { type: "New Streak", value: "🔥 7 Days" },
];
export default function DashboardActivity() {
    return(
        <div className="">
              <section>
        <h2 className="text-lg font-semibold mb-4 text-[#1A1023]">📊 Activity Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="px-4 py-2 rounded-tl-lg">Activity</th>
                <th className="px-4 py-2 rounded-tr-lg">Value</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{item.type}</td>
                  <td className="px-4 py-2 font-medium text-[#7e22ce]">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </div>
    )
}
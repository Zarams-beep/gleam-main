const summary = [
  { type: "Compliments Sent", value: 15 },
  { type: "Compliments Received", value: 9 },
  { type: "Active Days", value: 6 },
  { type: "New Streak", value: "7" },
];
export default function DashboardActivity() {
    return(
        <div className="dashboard-activity-summary">
        <h2 className="">Activity Summary</h2>
        <div className="table-container">
          <table className="">
            <thead>
              <tr className="">
                <th className="">Activity</th>
                <th className="">Value</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, i) => (
                <tr key={i} className="">
                  <td className="">{item.type}</td>
                  <td className="item-value">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
    )
}
"use client";
import StreakPieChart from "@/component/Dashboard/DashboardChart2";
import PerformanceChart from "@/component/Dashboard/DashBoardChart1";
import DashBoardHeader from "@/component/Dashboard/DashBoardHeader";
import DashBoardWallet1 from "@/component/Dashboard/wallet/DashBoardWallet";
import DashBoardWallet2 from "@/component/Dashboard/wallet/DashBoardWallet2";
import DashBoardWallet3 from "@/component/Dashboard/wallet/DashboardWallet3";
import DashBoardWallet4 from "@/component/Dashboard/wallet/DashboardWallet4";
import GleamDashboardSections from "@/component/Dashboard/downLandingSection/OtherLanding";


export default function Dashboard() {
  

  return (
    <div className="main-dashboard-container">
      <div className="home-container">
        <DashBoardHeader/>
        <div className="wallet-arrange-container">
        <DashBoardWallet1/>
<DashBoardWallet2 />
<DashBoardWallet3/>
<DashBoardWallet4/>
        </div>

<div className="other-dashboard-container">
        <div className="chart-container">
          <PerformanceChart/>
          <StreakPieChart/>
        </div>
        <GleamDashboardSections/>
        </div>
      </div>
    </div>
  );
}

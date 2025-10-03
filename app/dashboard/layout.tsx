//dashboard layout
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardNavBarPage from "@/component/Dashboard/DashBoardNavBar";
import DashboardSidebar from "@/component/Dashboard/DashBoardSideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();


  // Auth protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  

  if (status === "loading") {
    return <p>Loading...</p>; // could be a spinner
  }

  if (!session) return null;

return (
  <div className="dashboard-main-container">
    {/* Sidebar */}
    <DashboardSidebar />

    {/* Right section */}
    <div className="dashboard-main-container-2">
      {/* Navbar at top */}
      <DashboardNavBarPage />

      {/* Page content */}
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  </div>
);

}

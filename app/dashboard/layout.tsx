//dashboard layout
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNavBarPage from "@/component/DashBoardNavBar";
import DashboardSidebar from "@/component/DashBoardSideBar";
import MobileSidebar from "@/component/MediaDashBoardSideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Auth protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Responsive sidebar
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>; // could be a spinner
  }

  if (!session) return null;

return (
  <div className="dashboard-main-container">
    {/* Sidebar */}
    {isMobile ? <MobileSidebar /> : <DashboardSidebar />}

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

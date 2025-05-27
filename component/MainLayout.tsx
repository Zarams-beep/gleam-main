"use client";
import React, { useEffect, useState } from "react";
import DashboardSideBarPage from "./DashBoardSideBar";
import DashboardNavBarPage from "./DashBoardNavBar";
import MobileSidebar from "./MediaDashBoardSideBar";
// import { useRouter } from "next/navigation";
// import { CircularProgress } from "@mui/material";
// import { useAppSelector } from "../store/hooks";
// import { RootState } from "@/store/store";
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  // const router = useRouter();
  // const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkScreenSize(); // Run once
      window.addEventListener("resize", checkScreenSize);

      return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  // useEffect(() => {
  //   const verifyToken = async () => {
  //     if (!fullName) {
  //       setLoading(true);
  //       setTimeout(() => router.push("/page-not-found"), 1000); 
  //       return;
  //     }
  //     setLoading(false); 
  //   };

  //   verifyToken();
  // }, [fullName, router]);

  // if (loading) {
  //   return (
  //     <div className="">
  //       <CircularProgress />
  //     </div>
  //   );
  // }

  return (
    <div className="dashboard-main-container">
      {
        isMobile?<MobileSidebar/>:<DashboardSideBarPage />
      }
      
      <div className="dashboard-main-container-2">
        <DashboardNavBarPage />
        <div className="">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;

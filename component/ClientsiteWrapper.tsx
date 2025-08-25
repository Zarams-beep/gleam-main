"use client";
import { useState, useEffect, ReactNode, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import MediaHeaderSection from "./MediaHeader";
import HeaderSection from "@/component/Header";
import useIsInvalidPath from "./hooks/invalid-path";
import SplashScreen from "@/component/Splash";
import FooterSection from "@/component/Footer";

function QueryParamHandler({ setUserId }: { setUserId: (id: string | undefined) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    setUserId(searchParams.get("userId") ?? undefined);
  }, [searchParams, setUserId]);
  return null;
}

type ClientSideWrapperProps = {
  children: ReactNode;
};

export default function ClientSideWrapper({ children }: ClientSideWrapperProps) {
  const pathname = usePathname();
  const isInvalidPath = useIsInvalidPath();

  const [id, setUserId] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const hasShownSplash = sessionStorage.getItem("hasShownSplash");
    setShowSplash(!hasShownSplash);
    if (!hasShownSplash) sessionStorage.setItem("hasShownSplash", "true");

    const checkScreenSize = () => setIsMobile(window.innerWidth < 920);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [hasMounted]);

  if (!hasMounted) return <p>Loading...</p>;
  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <main className={`${isInvalidPath ? "mt-0" : ""} main-wrapping-container`}>
      <Suspense fallback={null}>
        <QueryParamHandler setUserId={setUserId} />
      </Suspense>

      {/* 👇 Hide header/footer for dashboard pages */}
      {!isDashboard && !isInvalidPath && (isMobile ? <MediaHeaderSection /> : <HeaderSection />)}
      
      {children}
      
      {!isDashboard && !isInvalidPath && <FooterSection />}
    </main>
  );
}

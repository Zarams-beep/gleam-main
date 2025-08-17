"use client";
import { useState, useEffect, ReactNode, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import MediaHeaderSection from "./MediaHeader";
import HeaderSection from "@/component/Header";
import MainLayout from "@/component/MainLayout";
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

  // Detect first mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Splash screen + screen size listener
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

  const isDashboard = hasMounted && pathname.startsWith("/dashboard");
  const useMainLayout = id !== undefined || isDashboard;

  if (!hasMounted) return <p>Loading...</p>;
  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  return (
    <main className={`${isInvalidPath ? "mt-0" : ""} main-wrapping-container`}>
      <Suspense fallback={null}>
        <QueryParamHandler setUserId={setUserId} />
      </Suspense>

      {useMainLayout ? (
        <MainLayout>
          <Suspense fallback={<p>Loading page...</p>}>{children}</Suspense>
        </MainLayout>
      ) : (
        <>
          {/* Only show header + footer if path is valid */}
          {!isInvalidPath && (isMobile ? <MediaHeaderSection /> : <HeaderSection />)}
          {children}
          {!isInvalidPath && <FooterSection />}
        </>
      )}
    </main>
  );
}


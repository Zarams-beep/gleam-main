"use client";
import { useState, useEffect, ReactNode, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

  const isDashboard = pathname.startsWith("/dashboard");

  // AnimatePresence + per-branch motion wrappers turn the splash → homepage
  // handoff into a crossfade instead of a hard conditional swap: the splash
  // fades/scales out while the real page fades in underneath it.
  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <SplashScreen onFinish={() => setShowSplash(false)} />
        </motion.div>
      ) : (
        <motion.main
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className={`${isInvalidPath ? "mt-0" : ""} main-wrapping-container`}
        >
          <Suspense fallback={null}>
            <QueryParamHandler setUserId={setUserId} />
          </Suspense>

          {/* 👇 Hide header/footer for dashboard pages */}
          {!isDashboard && !isInvalidPath && (isMobile ? <MediaHeaderSection /> : <HeaderSection />)}

          {children}

          {!isDashboard && !isInvalidPath && <FooterSection />}
        </motion.main>
      )}
    </AnimatePresence>
  );
}

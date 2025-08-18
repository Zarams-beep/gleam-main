"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

const invalidPaths = [
  "/login",
  "/sign-up",
  // "/auth/forgot-password",
  // "/auth/verify",
];

export default function useIsInvalidPath() {
  const pathname = usePathname();

  return useMemo(() => {
    return invalidPaths.includes(pathname);
  }, [pathname]); 
}

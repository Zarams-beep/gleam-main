// component/hooks/useGleamAuth.ts
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

/**
 * useGleamAuth
 * Protects dashboard pages.
 * Reads exclusively from Redux (persisted by redux-persist).
 * Manual localStorage fallback removed — redux-persist handles rehydration.
 */
export function useGleamAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAppSelector((s) => s.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return { user, token, isAuthenticated };
}

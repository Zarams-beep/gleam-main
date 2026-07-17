"use client";

import { useEffect } from "react";
import "@/styles/Error.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-sub-container">
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred. You can try again, or head back home.</p>
        <button type="button" className="error-btn" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/Error.css";

export default function NotFoundPage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(20);

  // Countdown effect
  useEffect(() => {
    if (secondsLeft <= 0) {
      router.push("/");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, router]);

  const progress = ((20 - secondsLeft) / 20) * 100; // progress circle %

  return (
    <div className="error-container">
      <div className="error-sub-container">
        <div className="error-image-container">
          <Image
            src="https://images.unsplash.com/photo-1506702315536-dd8b83e2dcf9?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600"
            alt="Not found"
            width={150}
            height={150}
            priority
          />
        </div>

        <h1>404 - Page Not Found</h1>
        <p>We couldn’t find the page you’re looking for.</p>

            <p className="error-404">
              {secondsLeft}s
            </p>
     
        <Link href="/" className="error-btn">
          Go Home
        </Link>
      </div>
    </div>
  );
}

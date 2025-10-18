"use client";

import Image from "next/image";
import Link from "next/link";
import "@/styles/Error.css";

export default function NotFoundPage() {
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

        <Link href="/" className="error-btn">
          Go Home
        </Link>
      </div>
    </div>
  );
}

import MainWrapper from "@/component/MainWrapper";
// Styles
import "./globals.css";
import "@/styles/Footer.css";
import type { Metadata, Viewport } from "next";

const siteUrl = "https://gleam-main.vercel.app";
const title = "Gleam — Bring a Little Gleam to Your Team";
const description =
  "Create a workplace where kindness flows, one anonymous compliment at a time. Recognize your team, boost morale, and build a brighter culture with Gleam.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // No title template — pages across this codebase already set full,
  // self-contained titles (e.g. "My Posts — Gleam Stories"), so a template
  // suffix here would double up on top of those instead of only filling in
  // for pages that omit metadata entirely.
  title,
  description,
  // app/favicon.ico (now the real Gleam logo, not the leftover CRA default)
  // is auto-detected by Next's file convention and needs no entry here.
  // Declaring icon.png as the modern PNG variant via `icons` — instead of a
  // manual <link> in <head> — avoids emitting duplicate rel="icon" tags.
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Gleam",
    title,
    description,
    images: [{ url: "/icon.png" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/icon.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5b50e8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Call useMediaQuery directly at the top level

  return (
    <html lang="en">
      <body>
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}

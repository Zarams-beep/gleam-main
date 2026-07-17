import MainWrapper from "@/component/MainWrapper";
// Styles
import "./globals.css";
import "@/styles/Footer.css";
export const metadata = {
  title: "Gleam",
  description: "Gleam",
  // app/favicon.ico (now the real Gleam logo, not the leftover CRA default)
  // is auto-detected by Next's file convention and needs no entry here.
  // Declaring icon.png as the modern PNG variant via `icons` — instead of a
  // manual <link> in <head> — avoids emitting duplicate rel="icon" tags.
  icons: {
    icon: "/icon.png",
  },
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

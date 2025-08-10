import MainWrapper from "@/component/MainWrapper";
// Styles
import "./globals.css";
import "@/styles/Footer.css";
export const metadata = {
  title: "Gleam",
  description: "Gleam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Call useMediaQuery directly at the top level

  return (
    <html lang="en">
       <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body>
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  );
}

// app/page.tsx
import HomePageSection from "@/component/HomePage";

export const metadata = {
  title: "Gleam — Bring a Little Gleam to Your Team",
  description:
    "Create a workplace where kindness flows, one anonymous compliment at a time. Recognize your team, boost morale, and build a brighter culture with Gleam.",
};

export default function Home() {
  return (
    <main className="">
      <HomePageSection />
    </main>
  );
}

import BlogListing from "@/component/Blog/BlogListing";

export const metadata = {
  title: "Gleam Stories — Blog",
  description: "Stories, wins, and lessons shared by the Gleam community.",
};

export default function Blog() {
  return <BlogListing />;
}

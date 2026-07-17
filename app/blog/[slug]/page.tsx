import BlogPostDetail from "@/component/Blog/BlogPostDetail";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostDetail slug={slug} />;
}

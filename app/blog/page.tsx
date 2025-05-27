"use client";
import BlogCategoryFilter from "@/component/Blog/blogCategory";
import CommentsSection from "@/component/Blog/blogComment";
import BlogHeroSection from "@/component/Blog/blogHero";
import NewsletterStickyCTA from "@/component/Blog/blogNewletter";
import "@/styles/Blog.css";
import { useMediaQuery } from 'react-responsive';

export default function Blog() {
  const isDesktop = useMediaQuery({ minWidth: 768 });

  return (
    <div className="blog-main-container container2">
      <BlogHeroSection />
      {!isDesktop ? <BlogCategoryFilter /> : null}
        {!isDesktop ? <div className="blog-media">
                <NewsletterStickyCTA />
                <CommentsSection/>
               </div> : null}
    </div>
  );
}

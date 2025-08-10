"use client";
import BlogCategoryFilter from "@/component/Blog/blogCategory";
import CommentsSection from "@/component/Blog/blogComment";
import BlogHeroSection from "@/component/Blog/blogHero";
import NewsletterStickyCTA from "@/component/Blog/blogNewletter";
import "@/styles/Blog.css";
import { useMediaQuery } from 'react-responsive';
const BlogAll = () => {
     const isDesktop = useMediaQuery({ minWidth: 768 });
  return (
    <div className="blog-main-container container">
      <BlogHeroSection />
      {!isDesktop ? <BlogCategoryFilter /> : null}
        {!isDesktop ? <div className="blog-media">
                <NewsletterStickyCTA />
                <CommentsSection/>
               </div> : null}
    </div>
  )
}

export default BlogAll

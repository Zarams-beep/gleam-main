"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  link: string;
  date: string;
  category: string;
};

const categories = [
  "All",
  "Kindness at Work",
  "Culture & Connection",
  "Remote Team Tips",
  "Leadership & Empathy",
  "Stories from Gleam Users",
  "Product Updates",
];

export default function BlogCategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetch("/gleam_blog_data.json")
      .then((res) => res.json())
      .then((data: BlogPost[]) => {
        if (data.length > 0) {
          setBlogPosts(data);
          setActivePost(data[0]);
        }
      })
      .catch((err) => console.error("Failed to load blog data", err));
  }, []);

  const filteredPosts =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  const otherPosts = filteredPosts.filter((post) => post.id !== activePost?.id);

  if (!activePost) return <div>Loading...</div>;

  return (
    <div className="blog-category-filter">
      <div className="category-buttons-wrapper">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${
              activeCategory === category ? "category-button-active" : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Featured Post */}
      <div className="featured-post">
        {/* <h2>{activePost.title}</h2> */}
        <div className="featured-post-img">
           <Image
              src={activePost.image}
              alt={activePost.title}
              width={150}
              height={150}
              quality={100}
            />
        </div>
       <div className="featured-post-content">
         <p>{activePost.excerpt}</p>
        <a href={activePost.link} className="read-more-link">Read more →</a>
       </div>
      </div>

      {/* Other Posts */}
      <div className="other-posts">
        {otherPosts.map((post) => (
          <div
            key={post.id}
            className="post-card"
            onClick={() => setActivePost(post)}
          >
           <div className="blog-category-img">
             <Image
              src={post.image}
              alt={post.title}
              width={90}
              height={90}
              quality={100}
            />
           </div>
           <div className="blog-category-content">
             <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
           </div>
          </div>
        ))}
      </div>
    </div>
  );
}

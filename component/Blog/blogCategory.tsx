"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Added Framer Motion

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

// ✅ Variants for fade/slide animations
const fadeSlide = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

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
      {/* Category Buttons */}
      <div className="category-buttons-wrapper">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`category-button ${
              activeCategory === category ? "category-button-active" : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Featured Post with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePost.id} // ✅ Required so Framer knows when post changes
          variants={fadeSlide}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="featured-post"
        >
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
            <a href={activePost.link} className="read-more-link">
              Read more →
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Other Posts */}
      <motion.div 
        className="other-posts"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { staggerChildren: 0.1 } 
          }
        }}
      >
        {otherPosts.map((post) => (
          <motion.div
            key={post.id}
            variants={fadeSlide}
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
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// components/CommentsSection.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Comment = {
  name: string;
  message: string;
  timestamp: string;
};

export default function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    const newComment: Comment = {
      name,
      message,
      timestamp: new Date().toLocaleString(),
    };

    setComments([newComment, ...comments]);
    setName("");
    setMessage("");
  };

  return (
    <section className="comment-container">
      <motion.h3 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        Leave a Comment
      </motion.h3>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className=""
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.textarea
          placeholder="Write something kind..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className=""
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <div className="btn-comment">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Post Comment
          </motion.button>
        </div>
      </motion.form>

      {/* Comments */}
      <div className="no-comment">
        <AnimatePresence mode="popLayout">
          {comments.length === 0 ? (
            <motion.p
              key="no-comments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className=""
            >
              No comments yet. Be the first!
            </motion.p>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={comment.timestamp} // better than index for uniqueness
                className="no-comment-sub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <h3>{comment.name}</h3>
                <h6>{comment.timestamp}</h6>
                <p>{comment.message}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// components/CommentsSection.tsx
"use client";
import { useState } from "react";

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
      <h3 className="">Leave a Comment</h3>
      <form onSubmit={handleSubmit} className="">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className=""
          required
        />
        <textarea
          placeholder="Write something kind..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className=""
          required
        ></textarea>
       <div className="btn-comment">
         <button
          type="submit"
          className=""
        >
          Post Comment
        </button>
       </div>
      </form>

      <div className="mt-8 space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="border-t pt-4">
              <p className="font-semibold">{comment.name}</p>
              <p className="text-sm text-gray-600 mb-1">{comment.timestamp}</p>
              <p>{comment.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

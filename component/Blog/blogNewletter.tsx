"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { z } from "zod";

// Define the schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function NewsletterStickyCTA() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError("");
    alert(`Subscribed with: ${email}`);
    setShow(false);
    setEmail(""); // Reset field
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="newletter-animation-container"
        >
          <div className="newletter-container">
            <div className="newletter-content-1">
              <button
                onClick={() => setShow(false)}
                className=""
              >
                ✕
              </button>
              <div className="newletter-img">
                <Image
                  src="/toa-heftiba-z9snuPiPKgQ-unsplash.jpg"
                  alt="newsletter img"
                  width={150}
                  height={150}
                  quality={100}
                />
              </div>
            </div>
            <div className="newletter-content-2">
              <h4>Join Our Newsletter</h4>
              <p>Stay inspired. Get the latest stories & updates.</p>
              <form onSubmit={handleSubmit} className="">
                <div className="input-div">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className=""
                    required
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
               <div className="btn-container">
                 <button
                  type="submit"
                  className=""
                >
                  Subscribe
                </button>
               </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

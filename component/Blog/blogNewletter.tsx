"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { z } from "zod";

// Validation schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function NewsletterStickyCTA() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [focusWithin, setFocusWithin] = useState(false); // replacement for whileFocusWithin

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
    setEmail("");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="newletter-animation-container"
        >
          <motion.div
            className="newletter-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Left Section */}
            <div className="newletter-content-1">
              <motion.button
                onClick={() => setShow(false)}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ✕
              </motion.button>
              <motion.div
                className="newletter-img"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Image
                  src="/toa-heftiba-z9snuPiPKgQ-unsplash.jpg"
                  alt="newsletter img"
                  width={150}
                  height={150}
                  quality={100}
                />
              </motion.div>
            </div>

            {/* Right Section */}
            <motion.div
              className="newletter-content-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h4>Join Our Newsletter</h4>
              <p>Stay inspired. Get the latest stories & updates.</p>
              <form
                onSubmit={handleSubmit}
                onFocus={() => setFocusWithin(true)}
                onBlur={() => setFocusWithin(false)}
              >
                <motion.div
                  className="input-div"
                  animate={{ scale: focusWithin ? 1.02 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </motion.div>
                <div className="btn-container">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Subscribe
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

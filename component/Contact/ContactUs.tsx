"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import emailjs from "@emailjs/browser";
import "@/styles/Contact.css";

// Zod schema for validation
const contactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactUs() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const [submitted, setSubmitted] = useState<null | boolean>(null);

  const onSubmit = async (data: ContactForm) => {
    try {
      const result = await emailjs.send(
        "service_a9abb4o", // Your service ID
        "template_159h0yl", // Your template ID
        {
          name: data.name,
          email: data.email,
          message: data.message,
        },
        "J4dTxIKT0OvYb470E" // Your public key
      );

      console.log("EmailJS result:", result.text);
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      setSubmitted(false);
    }
  };

  return (
   <div className="contact-us-container container">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ amount: 0.3, once: true }}
    className="contact-us-main"
  >
    {/* Left Side */}
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ amount: 0.3, once: true }}
      className="left-side"
    >
      <Image
        src="/s-o-c-i-a-l-c-u-t--3jdwGuAEnk-unsplash.jpg"
        alt="Contact Illustration"
        width={400}
        height={400}
        className="object-contain"
      />
    </motion.div>

    {/* Right Side */}
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ amount: 0.3, once: true }}
      className="right-side"
    >
      <h2>Let’s Connect</h2>
      <p>Got questions, feedback or partnership ideas? Drop us a message!</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-form">
          <label>Your Name</label>
          <input {...register("name")} placeholder="Enter Your Name" />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="input-form">
          <label>Email</label>
          <input {...register("email")} type="email" placeholder="Enter Your Email" />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="input-form">
          <label>Message</label>
          <textarea {...register("message")} rows={5} placeholder="Message" />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={isSubmitting}
          type="submit"
          className="bg-[#43366a] rounded-3xl text-white px-4 py-2.5 mt-4 hover:bg-accent"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </motion.button>

        <AnimatePresence mode="wait">
          {submitted === true && (
            <motion.p
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-green-500 mt-2"
            >
              ✅ Your message has been sent successfully!
            </motion.p>
          )}
          {submitted === false && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-500 mt-2"
            >
              ❌ Something went wrong. Please try again.
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  </motion.div>
</div>
  );
}

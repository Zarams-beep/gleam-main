"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import "@/styles/Contact.css"
// Zod schema
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

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: ContactForm) => {
    console.log("Form data:", data);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    reset();
  };

  return (
    <div className="contact-us-container">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="contact-us-main"
      >
        {/* Left Side */}
        <div className="left-side">
          <Image
            src="/s-o-c-i-a-l-c-u-t--3jdwGuAEnk-unsplash.jpg"
            alt="Contact Illustration"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        {/* Right Side */}
        <div className="right-side">
          <h2 className="">Let’s Connect</h2>
          <p className="">
            Got questions, feedback or partnership ideas? Drop us a message!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="input-form">
              <label className="">Your Name</label>
              <input
                {...register("name")}
                className=""
                placeholder="Enter Your Name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="input-form">
              <label className="">Email</label>
              <input
                {...register("email")}
                type="email"
                className=""
                placeholder="Enter Your Email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="input-form">
              <label className="">Message</label>
              <textarea
                {...register("message")}
                rows={5}
                className=""
                placeholder="Message"
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
              type="submit"
              className=""
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </motion.button>

            {submitted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 text-sm font-medium mt-2"
              >
                ✅ Your message has been sent successfully!
              </motion.p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

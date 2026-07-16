"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineEnvelope, HiOutlineInboxArrowDown } from "react-icons/hi2";
import { authApi } from "@/utils/api";
import WizardSteps from "@/component/WizardSteps";
import "@/styles/auth.css";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address").min(1, "Email is required"),
});
type EmailFormData = z.infer<typeof emailSchema>;

// Two-page reset flow: this page requests the PIN (steps "Email" → "Confirm"),
// /reset-password handles entering it (steps "Reset" → "Done"). The shared
// WizardSteps component keeps the step indicator visually continuous across
// both pages — a full page, not a modal, per the redesign brief.
const STEP_LABELS = ["Email", "Confirm", "Reset", "Done"];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

  const onSubmit = async (data: EmailFormData) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email });
      setEmail(data.email);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-left"
        initial={{ x: -80, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Image src="/caroline-attwood-983a7uWhdSs-unsplash.jpg" alt="reset password" width={470} height={470} quality={100} className="auth-left-img" />
        <div className="auth-left-overlay">
          <div className="auth-hero-content">
            <span className="hero-badge">Account recovery</span>
            <h2 className="hero-title">Forgot your password?</h2>
            <p className="hero-copy">
              No worries — it happens. Tell us your email and we&apos;ll send a secure PIN to get you back into Gleam.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="main-right-auth" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="right-auth">
          <div className="form-header">
            <h2 className="form-title">Reset your password</h2>
            <p className="form-subtitle">Remembered it after all?&nbsp;<Link href="/login" className="linking-auth">Back to login</Link></p>
          </div>

          <WizardSteps steps={STEP_LABELS} current={step} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="email-step" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <p className="fp-sub mb-4">Enter your account email and we&apos;ll send a secure reset PIN.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="fp-input-group">
                    <label className="fp-label" htmlFor="fp-email">Email</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><HiOutlineEnvelope color={errors.email ? "#e53e3e" : "#59676e"} size={18} /></span>
                      <input
                        id="fp-email"
                        type="email"
                        placeholder="you@company.com"
                        className={`input-field ${errors.email ? "input-error" : "input-normal"}`}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="fp-error">{errors.email.message}</p>}
                  </div>

                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm flex items-center justify-center gap-1.5 font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                      ⚠️ {errorMsg}
                    </motion.div>
                  )}

                  <button type="submit" disabled={loading} className="fp-btn-primary w-full mt-1" style={{ width: "100%" }}>
                    {loading ? "Sending..." : "Send reset PIN"}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="confirm-step" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <div className="flex flex-col items-center text-center gap-3 mb-5">
                  <div className="fp-icon-wrap"><HiOutlineInboxArrowDown color="#4f46e5" /></div>
                </div>

                <div className="fp-confirm-card">
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--auth-muted)" }}>Reset request submitted for</p>
                  <p className="fp-email-display">{email}</p>
                  <p>We&apos;ll send a PIN if this email is registered. If you don&apos;t receive it within a few minutes, check your spam folder.</p>
                </div>

                <div className="flex gap-2.5 mt-5">
                  <button type="button" onClick={() => setStep(1)} className="fp-btn-ghost flex-1">Use different email</button>
                  <button
                    type="button"
                    onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
                    className="fp-btn-primary flex-1"
                  >
                    I have my PIN
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

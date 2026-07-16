"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineKey, HiOutlineCheckCircle } from "react-icons/hi2";
import { CiMail } from "react-icons/ci";
import { authApi } from "@/utils/api";
import WizardSteps from "@/component/WizardSteps";
import "@/styles/auth.css";

const resetSchema = z.object({
  email: z.string().email("Enter a valid email address").min(1, "Email is required"),
  pin: z.string().min(1, "Please enter your PIN"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
type ResetFormData = z.infer<typeof resetSchema>;

const STEP_LABELS = ["Email", "Confirm", "Reset", "Done"];

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") ?? "";

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: prefilledEmail },
  });

  const onSubmit = async (data: ResetFormData) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await authApi.resetPassword({ email: data.email, pin: data.pin, newPassword: data.newPassword });
      setDone(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired PIN.");
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
            <h2 className="hero-title">Almost there</h2>
            <p className="hero-copy">
              Enter the PIN we sent you along with a new password to get back into your Gleam account.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="main-right-auth" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="right-auth">
          <div className="form-header">
            <h2 className="form-title">{done ? "Password updated" : "Verify & reset"}</h2>
            {!done && (
              <p className="form-subtitle">Didn&apos;t get a code?&nbsp;<Link href="/forgot-password" className="linking-auth">Request a new one</Link></p>
            )}
          </div>

          <WizardSteps steps={STEP_LABELS} current={done ? 4 : 3} />

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key="reset-step" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <p className="fp-sub mb-4">Enter the code from your email and choose a strong new password.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="fp-input-group">
                    <label className="fp-label" htmlFor="rp-email">Email</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><CiMail color={errors.email ? "#e53e3e" : "#59676e"} size={18} /></span>
                      <input
                        id="rp-email"
                        type="email"
                        placeholder="you@company.com"
                        readOnly={Boolean(prefilledEmail)}
                        className={`input-field ${errors.email ? "input-error" : "input-normal"}`}
                        style={prefilledEmail ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="fp-error">{errors.email.message}</p>}
                  </div>

                  <div className="fp-input-group">
                    <label className="fp-label" htmlFor="rp-pin">Reset PIN</label>
                    <div className="input-wrapper">
                      <span className="input-icon"><HiOutlineKey color={errors.pin ? "#e53e3e" : "#59676e"} size={18} /></span>
                      <input
                        id="rp-pin"
                        type="text"
                        placeholder="Enter the PIN from your email"
                        className={`input-field ${errors.pin ? "input-error" : "input-normal"}`}
                        {...register("pin")}
                      />
                    </div>
                    {errors.pin && <p className="fp-error">{errors.pin.message}</p>}
                  </div>

                  <div className="fp-input-group">
                    <label className="fp-label" htmlFor="rp-password">New password</label>
                    <div className="input-wrapper">
                      <input
                        id="rp-password"
                        type="password"
                        placeholder="At least 6 characters"
                        className={`input-field ${errors.newPassword ? "input-error" : "input-normal"}`}
                        {...register("newPassword")}
                      />
                    </div>
                    {errors.newPassword && <p className="fp-error">{errors.newPassword.message}</p>}
                  </div>

                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm flex items-center justify-center gap-1.5 font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                      ⚠️ {errorMsg}
                    </motion.div>
                  )}

                  <button type="submit" disabled={loading} className="fp-btn-primary" style={{ width: "100%" }}>
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="done-step" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <div className="fp-success-card">
                  <div className="fp-check-circle"><HiOutlineCheckCircle color="#059669" /></div>
                  <h3>All set!</h3>
                  <p>Your password has been updated. Return to the login screen and sign in with your new password.</p>
                </div>
                <button type="button" onClick={() => router.push("/login")} className="fp-btn-primary mt-5" style={{ width: "100%" }}>
                  Back to sign in
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

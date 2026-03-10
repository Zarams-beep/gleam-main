"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/userSlice";
import Image from "next/image";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { CiMail, CiLock } from "react-icons/ci";
import { FaEye, FaEyeSlash, FaRegCircle } from "react-icons/fa";
import { RiInformationLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData } from "@/types/auth";
import { loginSchema } from "@/features/LoginSchema";
import { useRouter, useSearchParams } from "next/navigation";
import ForgotPasswordModal from "@/component/ForgotttenPasswordModal";
import "@/styles/auth.css";
import { FcGoogle } from "react-icons/fc";
import { GrGithub } from "react-icons/gr";
import { motion } from "framer-motion";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [forgotOpen, setForgotOpen]     = useState(false);
  const [authError, setAuthError]       = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const dispatch     = useAppDispatch();

  const successMessage = searchParams.get("success");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // Redirect if already authenticated — admins go to command centre
  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role ?? "member";
      const isAdmin = ["super_admin", "admin"].includes(role);
      router.push(isAdmin ? "/dashboard/admin" : "/dashboard");
    }
  }, [status, router, session]);

  // Once session is populated, ALWAYS clear stale state then fetch fresh user
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const u = session.user as any;
      if (!u.accessToken) return;

      // Store token for api.ts
      localStorage.setItem("gleam_access_token", u.accessToken);

      // ✅ Immediately clear any persisted user (could be stale from previous session)
      // then fetch fresh data — this prevents showing wrong name/role on load
      import("@/utils/api").then(({ authApi }) => {
        authApi.me(u.accessToken).then((meRes: any) => {
          dispatch(setCredentials({
            token: u.accessToken,
            user: {
              id:         meRes.user.id,
              fullName:   meRes.user.fullName  || u.name || "",
              email:      meRes.user.email     || u.email || "",
              image:      meRes.user.image     ?? u.image ?? null,
              orgType:    meRes.user.orgType   ?? null,
              orgId:      meRes.user.orgId     ?? null,
              department: meRes.user.department ?? null,
              role:       meRes.user.role      ?? "member",
              stats: {
                coins:         meRes.user.stats?.coins         ?? 0,
                streak:        meRes.user.stats?.streak        ?? 0,
                performance:   meRes.user.stats?.performance   ?? 0,
                totalSent:     meRes.user.stats?.totalSent     ?? 0,
                totalReceived: meRes.user.stats?.totalReceived ?? 0,
              },
            },
          }));
        }).catch(() => {
          // Fallback: use session data directly
          dispatch(setCredentials({
            token: u.accessToken,
            user: {
              id: u.id, fullName: u.fullName || u.name || "",
              email: u.email || "", image: u.image ?? null,
              orgType: u.orgType ?? null, orgId: u.orgId ?? null,
              department: u.department ?? null, role: u.role ?? "member",
              stats: { coins: 0, streak: 0, performance: 0, totalSent: 0, totalReceived: 0 },
            },
          }));
        });
      });
    }
  }, [status, session, dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    // ✅ redirect: false — stays on this page so we can show the error ourselves
    const result = await signIn("credentials", {
      email:    data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      // NextAuth passes the error message through the URL — decode it
      setAuthError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password."
          : decodeURIComponent(result.error)
      );
      return;
    }

    // Success — router push handled by the useEffect above when session updates
    router.push("/dashboard");
  };

  const allFieldsFilled = watch("email") && watch("password");

  if (status === "loading") return <p className="text-center">Loading...</p>;

  return (
    <div className="auth-container">
      {/* Left side image */}
      <motion.div
        className="auth-left"
        initial={{ x: -80, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Image
          src="/cristofer-maximilian-NSKP7Gwa_I0-unsplash.jpg"
          alt="login image"
          width={470}
          height={470}
          quality={100}
        />
      </motion.div>

      {/* Right side form */}
      <motion.div
        className="main-right-auth"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="right-auth">
          {/* Header */}
          <motion.div
            className="form-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            <h2 className="form-title">
              {successMessage || "Welcome Back"}
            </h2>
            <p className="form-subtitle">
              Don't have an account?&nbsp;&nbsp;
              <Link href="/sign-up" className="linking-auth">Sign Up</Link>
            </p>

            <div className="auth-provider-container">
              <button onClick={() => signIn("google")} className="google-auth">
                <FcGoogle size={20} />
                Login with Google
              </button>
              <button onClick={() => signIn("github")} className="google-auth">
                <GrGithub size={20} />
                Login with Github
              </button>
            </div>
          </motion.div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-form-div">

              {/* Email */}
              <motion.div
                className="input-group"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
              >
                <label htmlFor="full-email" className="input-label">Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <CiMail color={errors.email ? "#f65252" : "#59676e"} size={18} />
                  </span>
                  <input
                    className={`input-field ${errors.email ? "input-error" : "input-normal"}`}
                    type="email"
                    id="full-email"
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <div className="error-message">
                    <RiInformationLine size={18} />
                    <p className="error-text">{errors.email.message}</p>
                  </div>
                )}
              </motion.div>

              {/* Password */}
              <motion.div
                className="input-group"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
              >
                <label htmlFor="password" className="input-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <CiLock color={errors.password ? "#f65252" : "#59676e"} size={18} />
                  </span>
                  <div className="input-second">
                    <input
                      className={`input-field ${errors.password ? "input-error" : "input-normal"}`}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter your password"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="show-password-toggle"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword
                        ? <FaEye color={errors.password ? "#f65252" : "#59676e"} size={18} />
                        : <FaEyeSlash color={errors.password ? "#f65252" : "#59676e"} size={18} />
                      }
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <div className="error-message">
                    <RiInformationLine size={18} />
                    <p className="error-text">{errors.password.message}</p>
                  </div>
                )}
              </motion.div>

              {/* Save details */}
              <motion.div
                className="checkbox-group"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.4 }}
              >
                <input
                  type="checkbox"
                  id="save-details"
                  className="checkbox"
                  {...register("saveDetails")}
                />
                <label htmlFor="save-details" className="checkbox-label">
                  Save details
                </label>
              </motion.div>

              {/* Forgot password */}
              <motion.p
                onClick={() => setForgotOpen(true)}
                className="forgot-password-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                Forgot password?
              </motion.p>
            </div>

            {/* Submit */}
            <motion.div
              className="auth-btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`submit-button ${allFieldsFilled ? "active-button" : "disabled-button"}`}
                type="submit"
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <FaRegCircle className="spinner-icon" />
                  </motion.div>
                ) : (
                  "Sign In"
                )}
              </motion.button>

              {authError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: "#dc2626",
                    fontSize: "0.875rem",
                    textAlign: "center",
                    marginTop: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontWeight: 600,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 10,
                    padding: "0.6rem 1rem",
                  }}
                >
                  ⚠️ {authError}
                </motion.p>
              )}
            </motion.div>
          </form>
        </div>
      </motion.div>

      {forgotOpen && (
        <ForgotPasswordModal
          open={forgotOpen}
          onClose={() => setForgotOpen(false)}
        />
      )}
    </div>
  );
};

export default Login;

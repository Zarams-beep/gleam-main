"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiMail, CiLock } from "react-icons/ci";
import { FaEye, FaEyeSlash, FaRegCircle } from "react-icons/fa";
import { RiMentalHealthFill, RiInformationLine } from "react-icons/ri";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { FiChevronDown, FiPlus, FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSubmitFormData } from "@/types/auth";
import { signUpSchema } from "@/features/SignUpSchema";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUploader from "@/component/imgComponent";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { authApi, orgApi } from "@/utils/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/userSlice";
import { setOrg } from "@/store/slices/orgSlice";
import "@/styles/auth.css";

const ORG_CREATOR_ROLES = ["super_admin", "admin"];

const WORKPLACE_DEPTS = [
  "Engineering","Product","Design","Marketing","Sales",
  "HR","Finance","Operations","Legal","Customer Support",
  "Data & Analytics","Executive",
];
const SCHOOL_DEPTS = [
  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12",
  "Science Department","Arts Department","Mathematics","Languages",
  "Social Studies","Physical Education","Staff / Teachers",
];

const SignUpComponent: React.FC = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const inviteCode   = searchParams.get("invite") ?? undefined;
  const dispatch     = useAppDispatch();

  const [error, setError]               = useState<string | null>(null);
  const [pending, setPending]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [loadingStep, setLoadingStep]   = useState<string>("");

  // Role-aware org fields
  const [selectedRole, setSelectedRole]     = useState<string>("member");
  const [orgName, setOrgName]               = useState("");
  const [orgType, setOrgType]               = useState<"workplace" | "school">("workplace");
  const [deptInput, setDeptInput]           = useState("");
  const [customDepts, setCustomDepts]       = useState<string[]>([]);
  const [useCustomDepts, setUseCustomDepts] = useState(false);

  const isOrgCreator = ORG_CREATOR_ROLES.includes(selectedRole);
  const presetDepts  = orgType === "workplace" ? WORKPLACE_DEPTS : SCHOOL_DEPTS;

  const addCustomDept = () => {
    const d = deptInput.trim();
    if (d && !customDepts.includes(d)) setCustomDepts((p) => [...p, d]);
    setDeptInput("");
  };

  const {
    register, handleSubmit,
    formState: { errors, isValid },
    setValue, trigger, watch,
  } = useForm<SignUpSubmitFormData>({ resolver: zodResolver(signUpSchema), mode: "onChange" });

  const watchedRole = watch("role");
  useEffect(() => { if (watchedRole) setSelectedRole(watchedRole); }, [watchedRole]);

  const submitData = async (data: SignUpSubmitFormData) => {
    if (isOrgCreator && !orgName.trim()) {
      setError("Please enter your organisation name.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLoadingStep("Creating account...");

      // 1. Register
      const registerRes = await authApi.register({
        fullName:        data.fullName,
        email:           data.email,
        password:        data.password,
        confirmPassword: data.confirmPassword ?? "",
        image:           data.image ?? null,
        role:            data.role ?? "member",
        inviteCode:      inviteCode ?? undefined,
      });

      if (registerRes?.pending) { setPending(true); return; }

      // 2. Token from register — use this EXPLICITLY for all subsequent API calls
      //    Never rely on localStorage/redux-persist for the org creation call.
      const expressToken = registerRes?.token;
      if (!expressToken) throw new Error("No token received from server.");

      // Store it so api.ts fallback also works
      localStorage.setItem("gleam_access_token", expressToken);

      // 3. Sign in via NextAuth in the background (don't await — don't let it race)
      //    We already have the express token; NextAuth session is just for useSession()
      setLoadingStep("Signing you in...");
      signIn("credentials", { email: data.email, password: data.password, redirect: false })
        .catch(() => {}); // non-blocking, non-fatal

      // 4. For org creators: create the org using the EXPLICIT token from register
      let freshOrgId: string | null = null;
      let freshOrgType = orgType;

      if (isOrgCreator && orgName.trim()) {
        setLoadingStep("Creating your organisation...");
        const depts = useCustomDepts
          ? customDepts.map((n) => ({ name: n }))
          : presetDepts.map((n) => ({ name: n }));

        // ✅ Pass expressToken directly — bypasses getToken() completely
        const orgRes = await orgApi.create(
          { name: orgName.trim(), orgType, departments: depts },
          expressToken
        );
        freshOrgId   = orgRes?.org?.id ?? null;
        freshOrgType = orgRes?.org?.orgType ?? orgType;

        if (orgRes?.org) {
          dispatch(setOrg({
            id:          orgRes.org.id,
            name:        orgRes.org.name,
            orgType:     orgRes.org.orgType,
            inviteCode:  orgRes.org.inviteCode,
            departments: orgRes.org.departments ?? [],
            is_active:   true,
          }));
        }
      }

      // 5. Fetch fresh user profile using the EXPLICIT token
      setLoadingStep("Loading your profile...");
      let finalUser = {
        id:         registerRes.user.id,
        fullName:   registerRes.user.fullName,
        email:      registerRes.user.email,
        image:      registerRes.user.image      ?? null,
        orgType:    (freshOrgType as any)       ?? null,
        orgId:      freshOrgId                  ?? null,
        department: registerRes.user.department ?? null,
        role:       (data.role ?? "member")     as any,
        stats: { coins: 0, streak: 0, performance: 0, totalSent: 0, totalReceived: 0 },
      };

      try {
        // ✅ Pass expressToken directly here too
        const meRes = await authApi.me(expressToken);
        if (meRes?.user) {
          finalUser = {
            id:         meRes.user.id,
            fullName:   meRes.user.fullName,
            email:      meRes.user.email,
            image:      meRes.user.image      ?? null,
            orgType:    meRes.user.orgType    ?? freshOrgType ?? null,
            orgId:      meRes.user.orgId      ?? freshOrgId   ?? null,
            department: meRes.user.department ?? null,
            role:       meRes.user.role       ?? (data.role ?? "member"),
            stats: {
              coins:         meRes.user.stats?.coins         ?? 0,
              streak:        meRes.user.stats?.streak        ?? 0,
              performance:   meRes.user.stats?.performance   ?? 0,
              totalSent:     meRes.user.stats?.totalSent     ?? 0,
              totalReceived: meRes.user.stats?.totalReceived ?? 0,
            },
          };
        }
      } catch { /* use register data as fallback */ }

      // 6. Store in Redux BEFORE navigating
      dispatch(setCredentials({ token: expressToken, user: finalUser }));

      // 7. Navigate
      if (isOrgCreator) {
        router.push("/dashboard/admin");
      } else {
        router.push("/onboarding");
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ─── Pending screen ───────────────────────────────────────────────────────
  if (pending) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "'DM Sans', sans-serif" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: "#fff", borderRadius: 22, padding: "3rem 2.5rem", maxWidth: 460, textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "#1a1740" }}>You're on the waitlist!</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: 24, fontSize: "0.9rem" }}>
            Your registration has been submitted. The organisation admin will review and you'll receive an email once approved.
          </p>
          <button onClick={() => router.push("/login")}
            style={{ marginTop: 24, padding: "0.75rem 2rem", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <motion.div className="auth-left" initial={{ x: -80, opacity: 0, scale: 0.95 }} animate={{ x: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <Image src="/caroline-attwood-983a7uWhdSs-unsplash.jpg" alt="sign up" width={470} height={470} quality={100} className="login-image" />
      </motion.div>

      <motion.div className="main-right-auth" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="right-auth">
          <div className="form-header">
            <h2 className="form-title">Create an account</h2>
            <p className="form-subtitle">Already have an account?&nbsp;<Link href="/login" className="linking-auth">Login</Link></p>
            {inviteCode && (
              <div style={{ background: "#d1fae5", borderRadius: 10, padding: "0.6rem 1rem", fontSize: "0.85rem", color: "#065f46", marginTop: 10, fontWeight: 600 }}>
                🔗 Joining via invite — your account will need admin approval before you can log in.
              </div>
            )}
          </div>

          <form className="auth-form" onSubmit={handleSubmit(submitData)}>
            <div className="auth-form-div">
              <div className="auth-section">

                {/* Avatar */}
                <div className="input-group img-group">
                  <ImageUploader folder="user_profiles" onUploaded={(img) => { setValue("image", img?.url ?? null); trigger("image"); }} />
                </div>

                {/* Full Name */}
                <div className="input-group">
                  <label htmlFor="full-name" className="input-label">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><RiMentalHealthFill color={errors.fullName ? "#f65252" : "#59676e"} size={18} /></span>
                    <input className={`input-field ${errors.fullName ? "input-error" : "input-normal"}`} type="text" id="full-name" placeholder="Enter your full name" {...register("fullName")} />
                  </div>
                  {errors.fullName && <div className="error-message"><RiInformationLine size={18} /><p className="error-text">{errors.fullName.message}</p></div>}
                </div>

                {/* Role */}
                <div className="input-group">
                  <label htmlFor="role" className="input-label">Your Role</label>
                  <div className="input-wrapper" style={{ position: "relative" }}>
                    <span style={{ fontSize: "1rem" }}>🎭</span>
                    <select id="role" {...register("role")} defaultValue="member"
                      onChange={(e) => setSelectedRole(e.target.value)}
                      style={{ background: "transparent", border: "none", outline: "none", fontSize: "0.9rem", width: "100%", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#1a1740", appearance: "none", WebkitAppearance: "none" }}>
                      <option value="member">Member</option>
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="org_admin">Org Admin</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <FiChevronDown style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af", fontSize: 13 }} />
                  </div>
                  {/* Role explanation */}
                  <AnimatePresence>
                    {isOrgCreator && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600, margin: "4px 0 0", paddingLeft: 2 }}>
                        👑 As {selectedRole === "super_admin" ? "Super Admin" : "Admin"} you'll create and own an organisation
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Org fields — only for super_admin / admin ── */}
                <AnimatePresence>
                  {isOrgCreator && (
                    <motion.div key="org-fields"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}>

                      {/* Section header */}
                      <div style={{ background: "linear-gradient(135deg, #ede9fe, #e8e6ff)", border: "1.5px solid #c4b5fd", borderRadius: 14, padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: 10, marginBottom: "0.9rem" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #5b50e8, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <HiOutlineBuildingOffice2 style={{ color: "#fff", fontSize: 16 }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#1a1740", fontFamily: "'Sora', sans-serif" }}>Create Your Organisation</p>
                          <p style={{ margin: 0, fontSize: "0.74rem", color: "#7c3aed" }}>You'll be the owner with full admin access</p>
                        </div>
                      </div>

                      {/* Org name */}
                      <div className="input-group" style={{ marginBottom: "0.9rem" }}>
                        <label className="input-label">Organisation Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <div className="input-wrapper">
                          <span style={{ fontSize: "1rem", flexShrink: 0 }}>🏢</span>
                          <input type="text" placeholder="e.g. Acme Corp or Greenfield High" value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.9rem", color: "#1a1740", fontFamily: "'DM Sans', sans-serif" }} />
                        </div>
                      </div>

                      {/* Org type */}
                      <div className="input-group" style={{ marginBottom: "0.9rem" }}>
                        <label className="input-label">Organisation Type</label>
                        <div style={{ display: "flex", gap: 10 }}>
                          {(["workplace", "school"] as const).map((t) => (
                            <button key={t} type="button" onClick={() => setOrgType(t)}
                              style={{ flex: 1, padding: "0.65rem", borderRadius: 12, border: `1.5px solid ${orgType === t ? "#5b50e8" : "#e4e2f8"}`, background: orgType === t ? "#5b50e8" : "#faf9ff", color: orgType === t ? "#fff" : "#7b77a8", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>
                              {t === "workplace" ? "🏢 Workplace" : "🏫 School"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Departments */}
                      <div className="input-group">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <label className="input-label" style={{ margin: 0 }}>Departments</label>
                          <button type="button" onClick={() => setUseCustomDepts((p) => !p)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "#5b50e8", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            {useCustomDepts ? "Use presets ↩" : "Customise ✏️"}
                          </button>
                        </div>
                        {!useCustomDepts ? (
                          <div style={{ background: "#faf9ff", border: "1.5px solid #e4e2f8", borderRadius: 12, padding: "0.75rem", display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {presetDepts.map((d) => <span key={d} style={{ fontSize: "0.72rem", background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{d}</span>)}
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                              <div className="input-wrapper" style={{ flex: 1, padding: "0.5rem 0.75rem" }}>
                                <input type="text" placeholder="Add department name..." value={deptInput}
                                  onChange={(e) => setDeptInput(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomDept())}
                                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.85rem", color: "#1a1740", fontFamily: "'DM Sans', sans-serif" }} />
                              </div>
                              <button type="button" onClick={addCustomDept}
                                style={{ padding: "0.5rem 0.85rem", background: "#5b50e8", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif" }}>
                                <FiPlus size={14} /> Add
                              </button>
                            </div>
                            {customDepts.length > 0 ? (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {customDepts.map((d) => (
                                  <span key={d} style={{ fontSize: "0.72rem", background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "3px 8px 3px 10px", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                                    {d}
                                    <button type="button" onClick={() => setCustomDepts((p) => p.filter((x) => x !== d))} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", padding: 0, display: "flex" }}><FiX size={11} /></button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: "0.78rem", color: "#b0aed0", margin: 0 }}>No departments added — presets will be used if empty.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="input-group">
                  <label htmlFor="full-email" className="input-label">Email</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><CiMail color={errors.email ? "#f65252" : "#59676e"} size={18} /></span>
                    <input className={`input-field ${errors.email ? "input-error" : "input-normal"}`} type="email" id="full-email" placeholder="Enter your email" {...register("email")} />
                  </div>
                  {errors.email && <div className="error-message"><RiInformationLine size={18} /><p className="error-text">{errors.email.message}</p></div>}
                </div>

                {/* Password */}
                <div className="input-group">
                  <label htmlFor="password" className="input-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><CiLock color={errors.password ? "#f65252" : "#59676e"} size={18} /></span>
                    <div className="input-second">
                      <input className={`input-field ${errors.password ? "input-error" : "input-normal"}`} type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" {...register("password")} />
                      <button type="button" className="show-password-toggle" onClick={() => setShowPassword((p) => !p)}>
                        {showPassword ? <FaEye color={errors.password ? "#f65252" : "#59676e"} size={18} /> : <FaEyeSlash color={errors.password ? "#f65252" : "#59676e"} size={18} />}
                      </button>
                    </div>
                  </div>
                  {errors.password && <div className="error-message"><RiInformationLine size={18} /><p className="error-text">{errors.password.message}</p></div>}
                </div>

                {/* Confirm Password */}
                <div className="input-group">
                  <label htmlFor="confirm-password" className="input-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><CiLock color={errors.confirmPassword ? "#f65252" : "#59676e"} size={18} /></span>
                    <div className="input-second">
                      <input className={`input-field ${errors.confirmPassword ? "input-error" : "input-normal"}`} type={showConfirm ? "text" : "password"} id="confirm-password" placeholder="Confirm your password" {...register("confirmPassword")} />
                      <button type="button" className="show-password-toggle" onClick={() => setShowConfirm((p) => !p)}>
                        {showConfirm ? <FaEye color={errors.confirmPassword ? "#f65252" : "#59676e"} size={18} /> : <FaEyeSlash color={errors.confirmPassword ? "#f65252" : "#59676e"} size={18} />}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && <div className="error-message"><RiInformationLine size={18} /><p className="error-text">{errors.confirmPassword.message}</p></div>}
                </div>

              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ color: "#dc2626", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "0.6rem 1rem" }}>
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="auth-btn">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`submit-button ${isValid ? "active-button" : "disabled-button"}`}
                type="submit" disabled={!isValid || loading}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}>
                      <FaRegCircle className="spinner-icon" />
                    </motion.div>
                    <span style={{ fontSize: "0.85rem" }}>{loadingStep || "Please wait..."}</span>
                  </div>
                ) : (
                  isOrgCreator ? "Create Account & Organisation" : "Create Account"
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpComponent;

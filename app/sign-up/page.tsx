"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiMail, CiLock } from "react-icons/ci";
import { FaEye, FaEyeSlash, FaRegCircle } from "react-icons/fa";
import { RiMentalHealthFill, RiInformationLine } from "react-icons/ri";
import { HiOutlineBuildingOffice2, HiOutlineUserGroup, HiOutlineKey } from "react-icons/hi2";
import { FiPlus, FiX, FiArrowLeft } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSubmitFormData } from "@/types/auth";
import { signUpSchema } from "@/features/SignUpSchema";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUploader from "@/component/imgComponent";
import WizardSteps from "@/component/WizardSteps";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { authApi, orgApi } from "@/utils/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/userSlice";
import { setOrg } from "@/store/slices/orgSlice";
import "@/styles/auth.css";

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

type SignupMode = "create" | "join" | null;

const SignUpComponent: React.FC = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const urlInviteCode = searchParams.get("invite") ?? undefined;
  const arrivedViaInviteLink = Boolean(urlInviteCode);
  const dispatch     = useAppDispatch();

  const [error, setError]               = useState<string | null>(null);
  const [pending, setPending]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [loadingStep, setLoadingStep]   = useState<string>("");

  // ─── Wizard state ───────────────────────────────────────────────────────
  // Someone who followed a real invite link already knows they're joining a
  // team, so we skip the "how will you use Gleam?" question entirely for
  // them and drop straight into the account-details step.
  const [step, setStep] = useState<1 | 2 | 3>(arrivedViaInviteLink ? 3 : 1);
  const [mode, setMode] = useState<SignupMode>(arrivedViaInviteLink ? "join" : null);
  const isOrgCreator = mode === "create";

  const [manualInviteCode, setManualInviteCode] = useState("");
  const [inviteCodeError, setInviteCodeError]   = useState<string | null>(null);

  const [orgName, setOrgName]               = useState("");
  const [orgType, setOrgType]               = useState<"workplace" | "school">("workplace");
  const [deptInput, setDeptInput]           = useState("");
  const [customDepts, setCustomDepts]       = useState<string[]>([]);
  const [useCustomDepts, setUseCustomDepts] = useState(false);
  const [orgNameError, setOrgNameError]     = useState<string | null>(null);

  const presetDepts = orgType === "workplace" ? WORKPLACE_DEPTS : SCHOOL_DEPTS;

  const addCustomDept = () => {
    const d = deptInput.trim();
    if (d && !customDepts.includes(d)) setCustomDepts((p) => [...p, d]);
    setDeptInput("");
  };

  const {
    register, handleSubmit,
    formState: { errors, isValid },
    setValue, trigger,
  } = useForm<SignUpSubmitFormData>({ resolver: zodResolver(signUpSchema), mode: "onChange" });

  const validateOrgName = (name: string): string | null => {
    const t = name.trim();
    if (!t) return "Organisation name is required.";
    if (t.length < 3) return "Organisation name must be at least 3 characters.";
    if (t.length > 60) return "Organisation name must be 60 characters or less.";
    if (!/^[a-zA-Z0-9\s\-'&.,()]+$/.test(t)) return "Organisation name contains invalid characters.";
    return null;
  };

  const goToStep3 = () => {
    if (mode === "create") {
      const nameErr = validateOrgName(orgName);
      if (nameErr) { setOrgNameError(nameErr); return; }
    }
    if (mode === "join") {
      if (manualInviteCode.trim().length < 4) {
        setInviteCodeError("Enter the invite code your organisation admin shared with you.");
        return;
      }
    }
    setStep(3);
  };

  const submitData = async (data: SignUpSubmitFormData) => {
    const effectiveInviteCode = arrivedViaInviteLink
      ? urlInviteCode
      : mode === "join" ? manualInviteCode.trim() : undefined;

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
        inviteCode:      effectiveInviteCode,
      });

      if (registerRes?.pending) { setPending(true); return; }

      // 2. Token from register — use this EXPLICITLY for all subsequent API calls
      //    Never rely on localStorage/redux-persist for the org creation call.
      const expressToken = registerRes?.token;
      if (!expressToken) throw new Error("No token received from server.");

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
        role:       (isOrgCreator ? "org_admin" : "member") as any,
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
            role:       meRes.user.role       ?? (isOrgCreator ? "org_admin" : "member"),
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
      dispatch(setCredentials({ user: finalUser }));

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 font-clean px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[1.4rem] p-10 sm:p-12 max-w-[460px] text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
        >
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-extrabold mb-3 text-primary">You&apos;re on the waitlist!</h2>
          <p className="text-neutral-300 leading-relaxed mb-6 text-sm">
            Your registration has been submitted. The organisation admin will review and you&apos;ll receive an email once approved.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-2 px-8 py-3 rounded-xl border-[1.5px] border-neutral-200 bg-white font-semibold text-neutral-300 hover:border-accent hover:text-accent transition-colors"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  const stepLabels = mode === "join"
    ? ["Get started", "Invite code", "Account"]
    : ["Get started", "Organisation", "Account"];

  return (
    <div className="auth-container">
      <motion.div className="auth-left" initial={{ x: -80, opacity: 0, scale: 0.95 }} animate={{ x: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <Image src="/caroline-attwood-983a7uWhdSs-unsplash.jpg" alt="sign up" width={470} height={470} quality={100} className="auth-left-img" />
        <div className="auth-left-overlay">
          <div className="auth-hero-content">
            <span className="hero-badge">Launch happier work</span>
            <h2 className="hero-title">Create your Gleam account</h2>
            <p className="hero-copy">
              Build a more positive workplace with easy onboarding, meaningful recognition, and reward-ready workflows.
            </p>
            <div className="hero-grid">
              <div className="hero-chip">Invite your team</div>
              <div className="hero-chip">Create culture</div>
              <div className="hero-chip">Track impact</div>
              <div className="hero-chip">Grow together</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="main-right-auth" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="right-auth">
          <div className="form-header">
            <h2 className="form-title">Create an account</h2>
            <p className="form-subtitle">Already have an account?&nbsp;<Link href="/login" className="linking-auth">Login</Link></p>
          </div>

          {!arrivedViaInviteLink && <WizardSteps steps={stepLabels} current={step} />}

          {arrivedViaInviteLink && (
            <div className="bg-emerald-50 rounded-xl px-4 py-2.5 text-sm text-emerald-800 mt-2 mb-4 font-semibold">
              🔗 Joining via invite — your account will need admin approval before you can log in.
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Step 1: how will you use Gleam? ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <p className="text-sm font-semibold text-primary mb-4">How will you use Gleam?</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => { setMode("create"); setStep(2); }}
                    className={`group flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all
                      ${mode === "create" ? "border-accent bg-accent/5" : "border-neutral-200 hover:border-accent/50"}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-lg shrink-0">
                      <HiOutlineBuildingOffice2 />
                    </div>
                    <div>
                      <p className="font-bold text-primary">Create a new organisation</p>
                      <p className="text-sm text-neutral-300 mt-1">Set up your workspace and invite your team. You&apos;ll be the owner.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode("join"); setStep(2); }}
                    className={`group flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all
                      ${mode === "join" ? "border-accent bg-accent/5" : "border-neutral-200 hover:border-accent/50"}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-lg shrink-0">
                      <HiOutlineUserGroup />
                    </div>
                    <div>
                      <p className="font-bold text-primary">Join an existing organisation</p>
                      <p className="text-sm text-neutral-300 mt-1">Enter your team&apos;s invite code to request access.</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2a: create org ── */}
            {step === 2 && mode === "create" && (
              <motion.div key="step2-create" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-semibold text-neutral-300 hover:text-primary mb-4 transition-colors">
                  <FiArrowLeft size={14} /> Back
                </button>

                <div className="input-group" style={{ marginBottom: "0.9rem" }}>
                  <label className="input-label">Organisation Name <span className="text-red-500">*</span></label>
                  <div className="input-wrapper" style={{ border: orgNameError ? "1.5px solid #f65252" : undefined }}>
                    <HiOutlineBuildingOffice2 style={{ color: orgNameError ? "#f65252" : "#59676e", fontSize: 18, flexShrink: 0 }} />
                    <input type="text" placeholder="e.g. Acme Corp or Greenfield High" value={orgName}
                      onChange={(e) => { setOrgName(e.target.value); setOrgNameError(null); }}
                      maxLength={60}
                      className="flex-1 border-none outline-none bg-transparent text-sm text-primary" />
                    <span className={`text-xs shrink-0 ${orgName.length > 50 ? "text-orange-500" : "text-neutral-300"}`}>{orgName.length}/60</span>
                  </div>
                  {orgNameError && (
                    <div className="error-message">
                      <RiInformationLine size={14} />
                      <p className="error-text">{orgNameError}</p>
                    </div>
                  )}
                </div>

                <div className="input-group" style={{ marginBottom: "0.9rem" }}>
                  <label className="input-label">Organisation Type</label>
                  <div className="flex gap-2.5">
                    {(["workplace", "school"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setOrgType(t)}
                        className={`flex-1 py-2.5 rounded-xl border-[1.5px] font-bold text-sm transition-all
                          ${orgType === t ? "border-accent bg-accent text-white" : "border-neutral-200 bg-neutral-50 text-neutral-300"}`}>
                        {t === "workplace" ? "🏢 Workplace" : "🏫 School"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="input-label" style={{ margin: 0 }}>Departments</label>
                    <button type="button" onClick={() => setUseCustomDepts((p) => !p)} className="text-xs font-semibold text-accent">
                      {useCustomDepts ? "Use presets ↩" : "Customise ✏️"}
                    </button>
                  </div>
                  {!useCustomDepts ? (
                    <div className="bg-neutral-50 border-[1.5px] border-neutral-200 rounded-xl p-3 flex flex-wrap gap-1.5">
                      {presetDepts.map((d) => <span key={d} className="text-xs bg-accent/10 text-accent rounded-full px-2.5 py-1 font-semibold">{d}</span>)}
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-1.5 mb-2">
                        <div className="input-wrapper flex-1" style={{ padding: "0.5rem 0.75rem" }}>
                          <input type="text" placeholder="Add department name..." value={deptInput}
                            onChange={(e) => setDeptInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomDept())}
                            className="flex-1 border-none outline-none bg-transparent text-sm text-primary" />
                        </div>
                        <button type="button" onClick={addCustomDept}
                          className="px-3.5 py-2 bg-accent text-white rounded-xl flex items-center gap-1 font-bold text-sm">
                          <FiPlus size={14} /> Add
                        </button>
                      </div>
                      {customDepts.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {customDepts.map((d) => (
                            <span key={d} className="text-xs bg-accent/10 text-accent rounded-full pl-2.5 pr-2 py-1 font-semibold flex items-center gap-1">
                              {d}
                              <button type="button" onClick={() => setCustomDepts((p) => p.filter((x) => x !== d))} className="flex text-accent"><FiX size={11} /></button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-200">No departments added — presets will be used if empty.</p>
                      )}
                    </div>
                  )}
                </div>

                <button type="button" onClick={goToStep3}
                  className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity">
                  Continue
                </button>
              </motion.div>
            )}

            {/* ── Step 2b: join org ── */}
            {step === 2 && mode === "join" && (
              <motion.div key="step2-join" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-semibold text-neutral-300 hover:text-primary mb-4 transition-colors">
                  <FiArrowLeft size={14} /> Back
                </button>

                <div className="input-group">
                  <label className="input-label">Invite Code <span className="text-red-500">*</span></label>
                  <div className="input-wrapper" style={{ border: inviteCodeError ? "1.5px solid #f65252" : undefined }}>
                    <HiOutlineKey style={{ color: inviteCodeError ? "#f65252" : "#59676e", fontSize: 18, flexShrink: 0 }} />
                    <input type="text" placeholder="e.g. GLEAM-AB12CD" value={manualInviteCode}
                      onChange={(e) => { setManualInviteCode(e.target.value); setInviteCodeError(null); }}
                      className="flex-1 border-none outline-none bg-transparent text-sm text-primary tracking-wide" />
                  </div>
                  {inviteCodeError && (
                    <div className="error-message">
                      <RiInformationLine size={14} />
                      <p className="error-text">{inviteCodeError}</p>
                    </div>
                  )}
                  <p className="text-xs text-neutral-300 mt-2">
                    Ask your organisation admin for this code. Your account will need their approval before you can log in.
                  </p>
                </div>

                <button type="button" onClick={goToStep3}
                  className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity">
                  Continue
                </button>
              </motion.div>
            )}

            {/* ── Step 3: account details ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                {!arrivedViaInviteLink && (
                  <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm font-semibold text-neutral-300 hover:text-primary mb-4 transition-colors">
                    <FiArrowLeft size={14} /> Back
                  </button>
                )}

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
                        className="text-red-600 text-sm flex items-center justify-center gap-1.5 font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpComponent;

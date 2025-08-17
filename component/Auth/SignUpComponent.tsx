"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiMail, CiLock } from "react-icons/ci";
import { FaEye, FaEyeSlash, FaRegCircle } from "react-icons/fa";
import { RiMentalHealthFill, RiInformationLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSubmitFormData } from "@/types/auth";
import { signUpSchema } from "@/features/SignUpSchema";
import { useRouter, useSearchParams} from "next/navigation";
import ImageUploader from "@/component/imgComponent";
import { useDispatch } from "react-redux";
import { setUserData } from "@/store/slices/authSlices";

import "@/styles/auth.css";
const SignUpComponent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<SignUpSubmitFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

const handleImageUpload = (base64: string | null) => {
  setUploadedImage(base64);
  setValue("image", base64); // store as Base64 string in form data
  trigger("image");
};



const handleShowPassword = () => {
  setShowPassword(!showPassword);
};
const handleShowConfirmPassword = () => {
  setShowConfirmPassword((prev) => !prev);
};


const dispatch = useDispatch();

const [loading, setLoading] = useState(false);

const submitData = async (data: SignUpSubmitFormData) => {
  try {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.status === 201) {
      router.push("/login?success=Account has been created");
    } else {
      const errMsg = await res.text();
      setError(errMsg || "Something went wrong");
    }
  } catch (err) {
    setError("Server error");
  } finally {
    setLoading(false);
  }
};



  return (
    <>
      <div className="auth-container">
        {/* -------- left half of signup page -------- */}
        <div className="auth-left">
          <Image
            src={"/caroline-attwood-983a7uWhdSs-unsplash.jpg"}
            alt="login image"
            width={470}
            height={470}
            quality={100}
            className="login-image"
          />
        </div>
        {/* -------- form input of signup page -------- */}
        <div className="right-auth">
          {/* -------- form heading -------- */}
          <div className="form-header">
            <h2 className="form-title">Create an account</h2>
            <p className="form-subtitle">
              Already have an account?&nbsp;
              <Link href={"/login"} className="">
                Login
              </Link>
            </p>
          </div>
          {/* -------- form details and input -------- */}
          <form
            className="auth-form"
            action=""
            onSubmit={handleSubmit(submitData)}
          >
            {/* -------- form details and save details button -------- */}
            <div className="auth-form-div">
              {/* -------- form details only -------- */}
              <div className="auth-section">
                {/* Image Upload */}
                <div className="input-group img-group">
                  <ImageUploader
  folder="user_profiles"
  onUploaded={(img) => {
    setValue("image", img?.url || null);
  }}
/>
                </div>
                {/* -------- full name -------- */}
                <div className="input-group">
                  <label htmlFor="full-name" className="input-label">
                    Full Name
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <RiMentalHealthFill
                        color={errors.email ? "#f65252" : "#59676e"}
                        size={18}
                      />
                    </span>
                    <input
                      className={`input-field ${
                        errors.fullName ? "input-error" : "input-normal"
                      }`}
                      type="text"
                      id="full-name"
                      placeholder="Enter your full name"
                      required
                      {...register("fullName")}
                    />
                  </div>
                  {errors.fullName && (
                    <div className="error-message">
                      <RiInformationLine size={"18px"} />
                      <p className="error-text">{errors.fullName.message}</p>
                    </div>
                  )}
                </div>
                {/* -------- email -------- */}
                <div className="input-group">
                  <label htmlFor="full-email" className="input-label">
                    Full Email
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <CiMail
                        color={errors.password ? "#f65252" : "#59676e"}
                        size={18}
                      />
                    </span>
                    <input
                      className={`input-field ${
                        errors.email ? "input-error" : "input-normal"
                      }`}
                      type="email"
                      id="full-email"
                      placeholder="Enter your full email"
                      required
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <div className="error-message">
                      <RiInformationLine size={"18px"} />
                      <p className="error-text">{errors.email.message}</p>
                    </div>
                  )}
                </div>
                {/* -------- password -------- */}
                <div className="input-group">
                  <label htmlFor="password" className="input-label">
                    Choose Password
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <CiLock
                        color={errors.password ? "#f65252" : "#59676e"}
                        size={18}
                      />
                    </span>
                    <div className="input-second">
                      <input
                        className={`input-field ${
                          errors.password ? "input-error" : "input-normal"
                        }`}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Enter your password"
                        required
                        {...register("password")}
                      />
                      <button
                        type="button"
                        className="show-password-toggle"
                        onClick={handleShowPassword}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {!showPassword ? (
                          <FaEyeSlash
                            color={errors.password ? "#f65252" : "#59676e"}
                            size={18}
                          />
                        ) : (
                          <FaEye
                            color={errors.password ? "#f65252" : "#59676e"}
                            size={18}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <div className="error-message">
                      <RiInformationLine size={"18px"} />
                      <p className="error-text">{errors.password.message}</p>
                    </div>
                  )}
                </div>
                {/* -------- confirm password -------- */}
                <div className="input-group">
                  <label htmlFor="confirm-password" className="input-label">
                    Confirm Password
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <CiLock
                        color={errors.password ? "#f65252" : "#59676e"}
                        size={18}
                      />
                    </span>
                    <div className="input-second">
                      <input
                        className={`input-field ${
                          errors.confirmPassword
                            ? "input-error"
                            : "input-normal"
                        }`}
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm-password"
                        placeholder="Enter your password"
                        required
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        className="show-password-toggle"
                        onClick={handleShowConfirmPassword}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {!showConfirmPassword ? (
                          <FaEyeSlash
                            color={errors.password ? "#f65252" : "#59676e"}
                            size={18}
                          />
                        ) : (
                          <FaEye
                            color={errors.password ? "#f65252" : "#59676e"}
                            size={18}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <div className="error-message">
                      <RiInformationLine size={"18px"} />
                      <p className="error-text">
                        {errors.confirmPassword.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="auth-btn">
           <button
  className={`submit-button ${isValid ? "active-button" : "disabled-button"}`}
  type="submit"
  disabled={!isValid || loading}
>
  {loading ? (
    <div className="loading-spinner">
      <FaRegCircle className="spinner-icon" />
    </div>
  ) : (
    "Create account"
  )}
</button>
</div>
          </form>
        </div>
      </div>
    </>
  );
};
export default SignUpComponent;

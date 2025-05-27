"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "@/store/slices/authSlices";
import Image from "next/image";
import Link from "next/link";
import { CiMail, CiLock } from "react-icons/ci";
import { FaEye, FaEyeSlash, FaRegCircle } from "react-icons/fa";
import { RiInformationLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData } from "@/types/auth";
import { loginSchema } from "@/features/LoginSchema";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "@/component/ForgotttenPasswordModal";
import "@/styles/auth.css";
const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const email = watch("email");
  const password = watch("password");
  const allFieldsFilled = email && password;

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);

    // Simulate user login with mock data
    setTimeout(() => {
      const mockUser = {
        fullName: "Jane Doe",
        image: null,
        email: data.email,
        token: "fake-token-123",
        id: "user-001",
      };

      dispatch(setUserData(mockUser));
      router.push(`/dashboard/${mockUser.id}/landing-page`);
      setIsLoading(false);
    }, 1000); 
  };

const [forgotOpen, setForgotOpen] = useState(false);
  return (
    <div className="auth-container auth-container-2">
      <div className="auth-left">
        <Image
          src={"/cristofer-maximilian-NSKP7Gwa_I0-unsplash.jpg"}
          alt="login image"
          width={470}
          height={470}
          quality={100}
        />
      </div>

      <div className="right-auth">
        <div className="form-header">
          <h2 className="form-title">Hi, Welcome back</h2>
          <p className="form-subtitle">
            Don’t have an account?&nbsp;&nbsp;
            <Link href={"/auth/sign-up"} className="linking-auth">
              Sign Up
            </Link>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
<div className="auth-form-div">
        {/* email */}
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email
            </label>
            <div className="input-wrapper">
            <span className="input-icon">
                <CiMail
                  color={errors.email ? "#f65252" : "#59676e"}
                  size={18}
                />
              </span>
              <input
                className={`input-field ${
                  errors.email ? "input-error" : "input-normal"
                }`}
                type="email"
                id="full-email"
                placeholder="Enter your email"
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
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

          <div className="checkbox-group">
            <input
              type="checkbox"
              name="save-details"
              id="save-details"
              className="checkbox"
            />
            <label htmlFor="save-details" className="checkbox-label">
              Save details
            </label>
            
          </div>
          <p onClick={() => setForgotOpen(true)} className="forgot-password-link">
  Forgot password?
</p>
</div>
  <div className="auth-btn">
          <button
            className={`submit-button ${
              allFieldsFilled ? "active-button" : "disabled-button"
            }`}
            type="submit"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <FaRegCircle className="spinner-icon" />
              </div>
            ) : (
              "Sign In"
            )}
          </button></div>
        </form>
      </div>
     {forgotOpen && (
  <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
)}

     
    </div>
  );
};

export default Login;

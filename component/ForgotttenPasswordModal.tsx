"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

// Schemas
const emailSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
});

const resetSchema = z.object({
  pin: z.string().min(1, "Kindly fill your pin"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");

  // Step 1: Email form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  // Step 3: Reset form
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const resetModal = () => {
    setStep(1);
    setEmail("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const onSubmitEmail = (data: EmailFormData) => {
    // Simulate API request
    console.log("Sending reset email to:", data.email);
    setEmail(data.email);
    setStep(2);
  };

  const onSubmitReset = (data: ResetFormData) => {
    // Simulate API request
    console.log("Verifying PIN:", data.pin, "New Password:", data.newPassword);
    setStep(4);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      className="dialog-modal"
    >
      <div className="dialog-modal-container">
        <DialogTitle className="dialog-title">
          {step === 1 && "Enter Your Email"}
          {step === 2 && "PIN Sent Successfully"}
          {step === 3 && "Verify PIN & Reset Password"}
          {step === 4 && "Password Reset Successfully"}
        </DialogTitle>

        <DialogContent dividers>
          {step === 1 && (
            <form onSubmit={handleEmailSubmit(onSubmitEmail)}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                {...registerEmail("email")}
                error={!!emailErrors.email}
                helperText={emailErrors.email?.message}
              />
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Next
                </Button>
              </DialogActions>
            </form>
          )}

          {step === 2 && (
            <>
              <Typography sx={{ mt: 2 }}>
                A 6-digit PIN has been sent to <strong>{email}</strong>.
              </Typography>
              <DialogActions>
                <Button onClick={() => setStep(3)} variant="contained">
                  Continue
                </Button>
              </DialogActions>
            </>
          )}

          {step === 3 && (
            <form onSubmit={handleResetSubmit(onSubmitReset)}>
              <TextField
                fullWidth
                label="Enter PIN"
                margin="normal"
                {...registerReset("pin")}
                error={!!resetErrors.pin}
                helperText={resetErrors.pin?.message}
              />
              <TextField
                fullWidth
                label="Enter New Password"
                type="password"
                margin="normal"
                {...registerReset("newPassword")}
                error={!!resetErrors.newPassword}
                helperText={resetErrors.newPassword?.message}
              />
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Reset Password
                </Button>
              </DialogActions>
            </form>
          )}

          {step === 4 && (
            <>
              <Typography color="success.main" sx={{ mt: 2 }}>
                Your password has been reset successfully! 🎉
              </Typography>
              <DialogActions>
                <Button onClick={handleClose}>Done</Button>
              </DialogActions>
            </>
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default ForgotPasswordModal;

// components/ForgotPasswordModal.tsx
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

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const resetModal = () => {
    setStep(1);
    setEmail("");
    setPin("");
    setNewPassword("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleNext = () => {
    switch (step) {
      case 1:
        setStep(2);
        break;
      case 2:
        setStep(3);
        break;
      case 3:
        setStep(4);
        break;
      default:
        handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" className="dialog-modal">
        <div className="dialog-modal-container">
      <DialogTitle className="dialog-title">
        {step === 1 && "Enter Your Email"}
        {step === 2 && "PIN Sent Successfully"}
        {step === 3 && "Verify PIN & Reset Password"}
        {step === 4 && "Password Reset Successfully"}
      </DialogTitle>
      <DialogContent dividers>
        {step === 1 && (
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            type="email"
          />
        )}
        {step === 2 && (
          <Typography sx={{ mt: 2 }}>
            A 6-digit PIN has been sent to <strong>{email}</strong>.
          </Typography>
        )}
        {step === 3 && (
          <>
            <TextField
              fullWidth
              label="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Enter New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />
          </>
        )}
        {step === 4 && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            Your password has been reset successfully! 🎉
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{step === 4 ? "Done" : "Cancel"}</Button>
        {step < 4 && (
          <Button
            onClick={handleNext}
            disabled={step === 1 && !email}
            variant="contained"
          >
            {step === 3 ? "Reset Password" : "Next"}
          </Button>
        )}
      </DialogActions></div>
    </Dialog>
  );
};

export default ForgotPasswordModal;

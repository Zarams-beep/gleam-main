
// Redux slice
interface SignupState {
    signupLoading: boolean;
    signupSuccess: boolean;
    signupError: string | null;
    signinLoading: boolean;
    signinSuccess: boolean;
    signinError: string | null;
    isAuthenticated: boolean;
    otpLoading: boolean;
    otpSuccess: boolean;
    otpError: string | null;
  }
  export type SignUpFormData = {
    fullName: string;
    image ?: File | null;
    email: string;
    password: string;
  };
  export type SignUpSubmitFormData = {
    fullName: string;
    image ?: File | null;
    email: string;
    password: string;
    confirmPassword?: string;
    saveDetails?:boolean;
  };

  export type LoginFormData= {
    email: string;
    password: string;
    rememberMe?: boolean;
  };
  

  // Type definition for contact form data
  export type ContactUsFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    subject: string;
    message?: string;
  };
  
  // Type defintion for meet doctor
  export type MeetDoctorForm ={
    name:string;
    phoneNumber:string;
    email:string;
    date:string;
    department:string;
    doctor:string;
    message:string;
  }
export type { SignupState }
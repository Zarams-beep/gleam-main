import Login from "@/component/Auth/LoginComponent";

export const metadata = {
  title: "Gleam Login",
  description: "This is Login Page",
};
export default function LoginPage (){
  return(
    <div className="">
      <Login/>
    </div>
  )
}
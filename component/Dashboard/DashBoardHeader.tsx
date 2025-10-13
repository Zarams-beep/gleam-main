"use client";
import { useSession } from "next-auth/react";

export default function DashBoardHeader() {
    const { data: session, status } = useSession();
    
      if (status === "loading") {
        return <p>Loading...</p>;
      }
    
      if (!session) {
        return <p>You’re not signed in.</p>;
      }
return(
     <section className="dashboard-after-header">
              <h1 className="">
                Hi {session.user?.fullName || session.user?.name}
              </h1>
              <p className="">
                Keep shining, your kindness makes a difference
              </p>
            </section>
)

}
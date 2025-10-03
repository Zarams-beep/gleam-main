import Wallet from "@/component/Dashboard/Wallet";

export default function Dashboard (){
    return(
        <div className="main-dashboard-container">
        <div className="home-container">
            <section className="text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                          Hi Chizaram, here’s your Gleam today ✨
                        </h1>
                        <p className="text-muted-foreground italic">
                          "Keep shining—your kindness makes a difference 💎"
                        </p>
                      </section>
            <Wallet/>
        </div></div>
    )
}
import CoreValuesSection from "@/component/About/aboutCore";
import AboutHero from "@/component/About/aboutHero"
import OurStorySection from "@/component/About/aboutStory";
import SocialProof from "@/component/About/aboutTestimonial";
import HowGleamWorks from "@/component/About/aboutWorks";
import "@/styles/AboutPage.css";
export default function AboutUS(){
    return(
        <>
           <div className="about-main">
           <AboutHero/>
           <OurStorySection/>
           <CoreValuesSection/>
           <HowGleamWorks/>
           <SocialProof/>
           </div>
        </>
    )
}
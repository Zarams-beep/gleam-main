// SocialProof.tsx
"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import "swiper/css";
import { FaRegSmileWink, FaRegSmileBeam } from "react-icons/fa";
import { FaFaceSmileBeam, FaFaceSmileWink } from "react-icons/fa6";
import { AiFillSmile, AiOutlineSmile } from "react-icons/ai";
import { PiSmileyMeltingFill } from "react-icons/pi";
import { GoGraph } from "react-icons/go";
import { SlGraph } from "react-icons/sl";
import { GiGrapple } from "react-icons/gi";
const testimonials = [
  {
    quote:
      "I used to feel invisible at work. Gleam changed that in just a week.",
    name: "Tosin A., Operations Lead",
    pic: "/male3.jpg",
  },
  {
    quote: "Morale across our department has never been higher.",
    name: "Amaka C., HR Manager",
    pic: "/female4.jpg",
  },
  {
    quote: "It’s not just software, it’s culture. Our people feel truly seen.",
    name: "James L., CEO at Crafters Inc.",
    pic: "/male2.jpg",
  },
  {
    quote: "I check my daily compliment every morning now—it’s my new habit!",
    name: "Bola K., Product Manager",
    pic: "/male1.jpg",
  },
  {
    quote: "Turnover dropped by 30% after we introduced Gleam.",
    name: "Nneka U., HR Director",
    pic: "/female3.jpg",
  },
  {
    quote: "It brought a fun, emotional spark to our corporate routine.",
    name: "Ayo O., Team Lead",
    pic: "/female2.jpg",
  },
];

const stats = [
  {
    label: "92%",
    value: "92%",
    icon:<GoGraph/>,
    description: "of users felt more appreciated in 2 weeks",
  },
  { label: "80K+", value: "80K+", icon: <SlGraph/>, description: "employees impacted globally" },
  { label: "20+", value: "20+", icon:<GiGrapple/>, description: "countries using Gleam" },
];

const logos = [
  <AiOutlineSmile />,
  <FaRegSmileWink />,
  <FaFaceSmileWink />,
  <FaFaceSmileBeam />,
  <FaRegSmileBeam />,
  <AiFillSmile />,
];

export default function SocialProof() {
  return (
    <section className="social-proof-section container2">
        <div className="social-proof-main">
        {/* Testimonials Carousel */}
        <div className="social-proof-container">
          <header className="header-story-section">
            <h2 className="">
              What People Are
              <span>
                Saying
                <PiSmileyMeltingFill className="fill-melt" />
              </span>
            </h2>

            <h4 className="">
              Real words. Real impact. Discover how Gleam is lighting up teams
              with kindness.
            </h4>
          </header>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={true}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="meet-team-swiper"
          >
            {testimonials.map((t, i) => (
              <SwiperSlide key={i}>
                <blockquote className="testimonial-block">
                  <div className="testimonial-img-container">
                    <Image
                      src={t.pic}
                      alt={t.pic}
                      width={80}
                      height={80}
                      quality={40}
                      className="testimonial-img"
                    />
                  </div>
                 <div className="testimonial-quote">
                 <p className="">“{t.quote}”</p>
                 <footer className="">— {t.name}</footer>
                 </div>
                </blockquote>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Stats */}
        <div className="about-stats">
          {stats.map((stat, i) => (
            <div key={i} className="stat-block">
              <header>
              <h3 className="stat-value">{stat.value}</h3>
              <p>{stat.icon}</p>
              </header>
              <p className="stat-description">{stat.description}</p>
            </div>
          ))}
        </div>
</div>
    </section>
  );
}

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { PiSmileyMeltingFill } from "react-icons/pi";
export default function TestimonialSection() {
  const testimonials = [
    {
      name: "John Doe",
      role: "CEO, Company A",
      message:
        "Gleam has transformed our culture. The positivity and recognition are unmatched!",
      image: "/male1.jpg",
    },
    {
      name: "Jane Smith",
      role: "HR Manager, Company B",
      message:
        "Team morale has skyrocketed. Employees feel appreciated every day.",
      image: "/female1.jpg",
    },
    {
      name: "Mark Johnson",
      role: "Product Manager, Company C",
      message:
        "A fantastic tool for boosting engagement and fostering team connection.",
      image: "/male2.jpg",
    },
    {
      name: "Sarah Lee",
      role: "Engineer, Company D",
      message:
        "I love sending compliments. It’s a game-changer for team bonding.",
      image: "/female2.jpg",
    },
    {
      name: "David Wright",
      role: "Marketing Director, Company E",
      message:
        "The fortune cookies are such a delightful and motivational touch!",
      image: "/male3.jpg",
    },
    {
      name: "Emily Davis",
      role: "Team Lead, Company F",
      message:
        "Gleam improves appreciation across departments—simple but powerful.",
      image: "/female3.jpg",
    },
  ];

  return (
    <section className="testimonial-slider-section  container2">
      <header className="feature-header">
        <h2 className="">What</h2>
        <div className="feature-header-2">
          <h2 className="">Our Users Say</h2>
          <PiSmileyMeltingFill className="icon-features" />
        </div>
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
        className="testimonial-slider-section-2"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="smaller-slider">
              <div>
                <div className="slider-img">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={80}
                  height={80}
                  className=""
                />
                </div>
                
               <div className="slider-quote">
               <FaQuoteLeft className="slider-icon" />
                <p className="">
                  {testimonial.message}
                </p>
                <FaQuoteRight className="slider-icon" />
               </div>
              </div>
              <div className="slider-profile">
                <h3 className="">{testimonial.name}</h3>
                <p className="">{testimonial.role}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

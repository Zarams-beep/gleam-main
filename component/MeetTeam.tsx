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
      image: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      name: "Jane Smith",
      role: "HR Manager, Company B",
      message:
        "Team morale has skyrocketed. Employees feel appreciated every day.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      name: "Mark Johnson",
      role: "Product Manager, Company C",
      message:
        "A fantastic tool for boosting engagement and fostering team connection.",
      image: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
    },
    {
      name: "Sarah Lee",
      role: "Engineer, Company D",
      message:
        "I love sending compliments. It’s a game-changer for team bonding.",
      image: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
    },
    {
      name: "David Wright",
      role: "Marketing Director, Company E",
      message:
        "The fortune cookies are such a delightful and motivational touch!",
      image: "https://images.unsplash.com/photo-1503235930437-8c6293ba41f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
    },
    {
      name: "Emily Davis",
      role: "Team Lead, Company F",
      message:
        "Gleam improves appreciation across departments—simple but powerful.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D",
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
          2000: { slidesPerView: 4 },
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
                  width={200}
                  height={200}
                  quality="100"
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

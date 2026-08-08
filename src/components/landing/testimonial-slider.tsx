"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Star, Quote } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Vikram Mehta",
    role: "CEO & Co-Founder",
    company: "Apex Agency",
    content: "GrowthSprint365 transformed our client communication. We went from missing 30% of incoming leads to a 100% response rate within 2 minutes. The AI booking assistant handles 80% of scheduling without any human rep intervention.",
    rating: 5,
    avatar: "VM",
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    role: "Marketing Director",
    company: "D2C Brands Inc.",
    content: "The broadcast campaign metrics are incredibly accurate. We ran a WhatsApp promo message to 5,000 segmented contacts and got a 42% click-through rate. It beats email marketing by a mile!",
    rating: 5,
    avatar: "SJ",
  },
  {
    id: "3",
    name: "Dr. Amit Roy",
    role: "Founder",
    company: "Metro Dental Clinics",
    content: "Our appointment reminders now go through WhatsApp automations. Patients can confirm or reschedule instantly with a click of a button. No-show rates dropped from 15% to under 2%. Highly recommend GrowthSprint365!",
    rating: 5,
    avatar: "AR",
  },
  {
    id: "4",
    name: "Elena Rostova",
    role: "Real Estate Broker",
    company: "Elite Realtors",
    content: "The Kanban pipeline view linked to WhatsApp conversations is exactly what we needed. We can assign conversations directly to agents and track property deals in real time without leaving the chat inbox.",
    rating: 5,
    avatar: "ER",
  },
];

export const TestimonialSlider: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {TESTIMONIALS.slice(0, 2).map((test) => (
          <div key={test.id} className="bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm">
            <div className="flex gap-1 mb-4 text-amber-400">
              {[...Array(test.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-slate-600 italic text-sm mb-6">"{test.content}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                {test.avatar}
              </div>
              <div>
                <h5 className="text-sm font-semibold text-slate-800">{test.name}</h5>
                <p className="text-xs text-slate-500">{test.role}, {test.company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 testimonial-swiper-wrapper">
      <Swiper
        spaceBetween={30}
        centeredSlides={false}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="pb-16"
      >
        {TESTIMONIALS.map((test) => (
          <SwiperSlide key={test.id}>
            <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-between relative overflow-hidden group">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-100 group-hover:text-emerald-50/50 transition-colors pointer-events-none" />
              
              <div>
                {/* Rating */}
                <div className="flex gap-1 mb-4 text-amber-400 relative z-10">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-600 text-sm md:text-base leading-relaxed italic mb-8 relative z-10">
                  "{test.content}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto relative z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                  {test.avatar}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800 leading-none mb-1">
                    {test.name}
                  </h5>
                  <p className="text-xs text-slate-500 leading-none">
                    {test.role} &middot; <span className="font-medium text-slate-600">{test.company}</span>
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

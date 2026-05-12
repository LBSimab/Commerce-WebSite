"use client";

/**
 * ProductCarousel Component
 *
 * Beautiful horizontal product carousel using Swiper.
 * Shows product cards with smooth sliding, autoplay, and navigation.
 * Used on the homepage to showcase featured products.
 */

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ products, locale }) {
  const isRTL = locale === "fa";

  if (!products || products.length === 0) return null;

  return (
    <section className="relative bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8 md:py-10 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}

        {/* Swiper Carousel */}
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1.2}
          centeredSlides={false}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
            1280: { slidesPerView: 4 },
          }}
          className="!pb-10"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <ProductCard product={product} locale={locale} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows */}
        <button className="custom-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 -translate-x-1/2 hidden md:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button className="custom-next absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 translate-x-1/2 hidden md:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #c7d2fe;
          opacity: 1;
          transition: all 0.3s;
        }
        .swiper-pagination-bullet-active {
          background: #6366f1;
          width: 28px;
          border-radius: 8px;
        }
        .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
}

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const count = banners.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const prev = () => setCurrent((prev) => (prev - 1 + count) % count);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, count]);

  if (count === 0) {
    return (
      <div
        className="w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
        style={{ height: "clamp(220px, 45vw, 580px)" }}
      >
        <span className="text-gray-400 text-sm">배너 없음</span>
      </div>
    );
  }

  return (
    <section
      className="relative overflow-hidden bg-gray-100"
      style={{ height: "clamp(220px, 45vw, 580px)" }}
    >
      {banners.map((banner, i) => {
        const Wrapper = banner.linkUrl ? Link : "div";
        const wrapperProps = banner.linkUrl
          ? { href: banner.linkUrl }
          : {};
        return (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            {/* @ts-expect-error dynamic tag */}
            <Wrapper {...wrapperProps} className="block w-full h-full">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover object-center"
                priority={i === 0}
                sizes="100vw"
              />
            </Wrapper>
          </div>
        );
      })}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="이전"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="다음"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}

"use client";

import HeroImageEditor from "@/components/admin/HeroImageEditor";

export default function AdminHeroPage() {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="font-primary text-[32px] text-secondary leading-tight mb-1">
          Hero & Featured <em className="text-gold not-italic font-semibold">Showcase</em>
        </h1>
        <p className="font-secondary text-[14px] text-secondary/50">
          Control your homepage Hero image, display headlines, and the 3 arched capsule Featured cards.
        </p>
      </header>

      <HeroImageEditor />
    </div>
  );
}

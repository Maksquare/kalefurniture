"use client";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <Link
      href="/"
      className="cursor-pointer flex items-center w-fit select-none group"
    >
      <div className="relative w-[70px] h-[70px] md:w-[85px] md:h-[85px] flex-shrink-0">
        <Image 
          src="/logo.png"
          alt="Kale Furniture"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 70px, 85px"
          priority
        />
      </div>
    </Link>
  );
};

export default Logo;
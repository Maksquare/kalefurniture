"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiSquaresFour, PiArmchair, PiSignOut, PiLockKeyLight, PiList, PiX } from "react-icons/pi";
import Logo from "@/components/Logo";
import { logout } from "./actions";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: PiSquaresFour },
  { name: "Products", href: "/admin/products", icon: PiArmchair },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide the sidebar completely on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-primary text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="scale-75 origin-left">
          <Logo isDarkText={false} />
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          <PiList size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-primary text-white flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="pt-8 pb-6 px-10 border-b border-white/10 flex items-center justify-between md:justify-start">
          <div className="scale-90 origin-left">
            <Logo isDarkText={false} />
          </div>
          <button 
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PiX size={24} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <p className="font-secondary text-[10px] font-bold tracking-widest uppercase text-white/40 mb-4 px-4">
            Menu
          </p>
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-secondary text-[13px] font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gold/20 text-gold shadow-[0_0_15px_rgba(217,182,110,0.1)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`text-xl ${isActive ? "text-gold" : ""}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-secondary text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <PiSignOut className="text-xl" />
            Exit to Store
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-secondary text-[13px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 cursor-pointer"
            >
              <PiLockKeyLight className="text-xl" />
              Lock Dashboard
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-[#FDFBF7] md:ml-64 w-full">
        {children}
      </main>
    </div>
  );
}

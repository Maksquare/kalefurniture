"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { PiLockKeyLight, PiArrowRightLight, PiEnvelopeLight } from "react-icons/pi";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Database configuration error. Missing environment variables.");
        setIsLoading(false);
        return;
      }

      // Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data?.session?.access_token) {
        setError(authError?.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Set the session cookie directly in document.cookie
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      document.cookie = `admin_token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isHttps ? "; Secure" : ""}`;

      // Synchronize with backend API session endpoint
      try {
        await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: data.session.access_token }),
        });
      } catch (e) {
        console.warn("Backend session cookie sync notice:", e);
      }

      window.location.href = "/admin";
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred connecting to the server.");
      setIsLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 relative z-10 border border-primary/5"
      >
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="font-primary text-[28px] font-semibold text-secondary mb-2">Admin Access</h1>
          <p className="font-secondary text-sm text-secondary/60">
            Please log in with your admin credentials to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary/40">
              <PiEnvelopeLight size={20} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              required
              className="w-full pl-12 pr-4 py-4 bg-[#Fdfbf7] border border-primary/10 rounded-xl font-secondary text-sm text-secondary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary/40">
              <PiLockKeyLight size={20} />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full pl-12 pr-4 py-4 bg-[#Fdfbf7] border border-primary/10 rounded-xl font-secondary text-sm text-secondary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm font-secondary text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-secondary text-sm font-medium py-4 rounded-xl hover:bg-gold transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isLoading ? "Authenticating..." : "Unlock Dashboard"}
            {!isLoading && <PiArrowRightLight className="group-hover:translate-x-1 transition-transform" size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

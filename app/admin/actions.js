"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Verify credentials securely with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    // Return a generic error message for security
    return { error: "Invalid email or password" };
  }

  // If Supabase verifies the user, drop our local admin cookie
  // We use the access_token as the cookie value just in case we need it later
  const cookieStore = await cookies();
  cookieStore.set("admin_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
  
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}

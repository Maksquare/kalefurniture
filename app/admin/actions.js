"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (e) {
    return { error: "Database configuration error. Missing environment variables." };
  }

  // Verify credentials securely with Supabase Auth via SSR server client
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: error?.message || "Invalid email or password" };
  }

  // Set admin_token cookie for middleware & session validation
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

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (e) {}

  redirect("/admin/login");
}

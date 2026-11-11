import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    let accessToken = null;
    try {
      const body = await request.json();
      accessToken = body?.access_token;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true, redirectUrl: "/admin" });
    
    // Set cookie directly on NextResponse
    response.cookies.set("admin_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[admin/login] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create admin session" },
      { status: 500 }
    );
  }
}

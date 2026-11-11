import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear admin_token cookie directly on NextResponse
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      secure: false,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[admin/logout] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to log out" },
      { status: 500 }
    );
  }
}

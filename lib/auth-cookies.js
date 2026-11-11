export function getAdminCookieOptions(request) {
  const isProduction = process.env.NODE_ENV === "production";
  let secure = false;

  if (isProduction && request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    if (forwardedProto) {
      secure = forwardedProto.split(",")[0].trim() === "https";
    } else {
      secure = request.nextUrl?.protocol === "https:";
    }
  }

  return {
    httpOnly: true,
    secure,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  };
}

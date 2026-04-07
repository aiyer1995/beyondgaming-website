import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow the maintenance page itself to render
  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

export const config = {
  // Run on every request except Next.js internals and any path with a file
  // extension (favicon, images, manifest, etc.)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

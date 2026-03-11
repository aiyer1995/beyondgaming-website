import { cookies } from "next/headers";

const COOKIE_NAME = "bg_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setSession(customerId: number) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, String(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  const id = parseInt(cookie.value, 10);
  return isNaN(id) ? null : id;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

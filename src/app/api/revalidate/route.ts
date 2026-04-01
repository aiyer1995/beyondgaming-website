import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

async function handleRevalidate(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get("secret");
    if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    // Clear Redis cache and Next.js ISR cache
    await invalidateCache();
    revalidatePath("/", "layout");

    return NextResponse.json({ revalidated: true, cacheCleared: true, time: Date.now() });
  } catch {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}

export async function POST(request: NextRequest) {
  return handleRevalidate(request);
}

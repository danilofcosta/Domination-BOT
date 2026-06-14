import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") || "myKey";
  try {
    const redis = await getRedis();
    const value = await redis.get(key);
    return NextResponse.json({ key, value });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as unknown;

  return NextResponse.json({ message: "Webhook received" });
}

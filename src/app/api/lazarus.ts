import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { sessions } from "~/server/db/schema";

export async function GET() {
  await db.insert(sessions).values({
    expires: new Date(),
    sessionToken: "UNUSED",
    userId: "UNUSED",
  });

  return NextResponse.json({ message: "CRON executed, db won't die. For now" });
}

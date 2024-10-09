import { NextResponse } from "next/server";
import { backendSupabase } from "~/server/supabase";
import { env } from "~/env";

export async function POST(req: Request) {
  // TODO: call celery worker
  // TODO: stream events to frontend
}

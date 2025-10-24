export const dynamic = "force-static";

import { NextResponse } from "next/server";
import survey from "@/data/survey.json";

export async function GET() {
  return NextResponse.json(survey);
}

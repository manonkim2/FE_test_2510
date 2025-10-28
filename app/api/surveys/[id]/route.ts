import { NextResponse } from "next/server";
import survey from "@/data/survey.json";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id !== "join-reasons-2025") {
    return NextResponse.json({ message: "Survey not found" }, { status: 404 });
  }

  return NextResponse.json(survey);
}

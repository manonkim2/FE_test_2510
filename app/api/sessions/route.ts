import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = req.headers.get("X-Session-Token");

  if (!token) {
    return NextResponse.json(
      { message: "Missing X-Session-Token" },
      { status: 400 }
    );
  }

  const body = await req.json();

  if (body.surveyId !== "join-reasons-2025") {
    return NextResponse.json({ message: "Invalid surveyId" }, { status: 404 });
  }

  const sessionId = crypto.randomUUID();

  return NextResponse.json({
    sessionId,
    surveyId: body.surveyId,
    isCompleted: false,
    nextQuestionId: "q1",
  });
}

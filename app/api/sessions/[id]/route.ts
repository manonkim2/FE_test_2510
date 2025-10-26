import { NextResponse } from "next/server";

/**
 * GET /api/sessions/:id
 * 기본 세션 정보만 반환.
 * 실제 진행 상태는 클라이언트(localStorage)에서 복원.
 */
export async function GET(req: Request) {
  const token = req.headers.get("X-Session-Token");

  if (!token) {
    return NextResponse.json(
      { message: "Forbidden: Missing token" },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const sessionId = pathSegments[2];

  if (!sessionId) {
    return NextResponse.json(
      { message: "Forbidden: Missing sessionId" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    sessionId,
    surveyId: "join-reasons-2025",
    isCompleted: false,
    lastQuestionId: null,
    answers: [],
  });
}

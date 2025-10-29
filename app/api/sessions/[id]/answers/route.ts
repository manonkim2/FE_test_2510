import { NextResponse } from "next/server";
import surveys from "@/data/survey.json";
import { ISurveyOption, ISurveyQuestion } from "@/app/(survey)/_types/survey";
import { hasSession, sessions } from "../../sessionStore";

export interface IAnswerResponse {
  status: "completed" | "inProgress";
  nextQuestionId: string | null;
  completed: boolean;
}

const completedSessions = new Set<string>();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<IAnswerResponse | { message: string }>> {
  const { id } = await params;

  const token = req.headers.get("X-Session-Token");

  // [403] 유효하지 않은 세션: 토큰 없거나, 토큰에 해당하는 세션이 존재하지 않음
  if (!token || !hasSession(token)) {
    return NextResponse.json({ message: "Invalid session" }, { status: 403 });
  }

  const validSessionId = sessions.get(token);

  // [403] 세션 불일치: URL의 :id 와 서버가 기억하는 sessionId가 다름
  if (validSessionId !== id) {
    return NextResponse.json(
      { message: "Forbidden: Session mismatch" },
      { status: 403 }
    );
  }

  // [403] 이미 완료된 세션에서 추가 제출 시도
  if (completedSessions.has(validSessionId)) {
    return NextResponse.json(
      { message: "Forbidden: Session already completed" },
      { status: 403 }
    );
  }

  // 3) 요청 본문 파싱 (실패하더라도 서버가 죽지 않도록 try-catch 대체)
  const body = await req.json().catch(() => ({}));

  // [400] DTO 오류: questionId 누락
  if (!body?.questionId) {
    return NextResponse.json(
      { message: "Missing questionId" },
      { status: 400 }
    );
  }

  // 4) 설문 정의에서 questionId로 질문 찾기
  //    - /surveys/:surveyId 호출로 받은 전체 질문셋을 클라이언트/서버가 공유한다고 가정
  const data = surveys.questions as ISurveyQuestion[];
  const question = data.find((q: ISurveyQuestion) => q.id === body.questionId);

  // [404] 존재하지 않는 questionId
  if (!question) {
    return NextResponse.json(
      { message: "Question not found" },
      { status: 404 }
    );
  }

  // 5) 다음 질문(nextQuestionId) 계산
  //    - 공통: question.nextQuestionId가 있으면 기본으로 사용
  //    - 단일선택(singleChoice): 선택지의 nextQuestionId가 우선
  let nextQuestionId: string | null = question.nextQuestionId ?? null;

  if (question.type === "singleChoice" && body?.answer?.optionId) {
    // 사용자가 고른 optionId로 옵션 조회
    const selected = question?.options?.find(
      (opt: ISurveyOption) => opt.id === body.answer.optionId
    );

    // [422] 분기 위반: 존재하지 않는 optionId (허용되지 않은 분기)

    if (!selected) {
      return NextResponse.json(
        { message: "Unprocessable: invalid optionId" },
        { status: 422 }
      );
    }

    // 선택지에 지정된 분기가 있으면 그쪽으로 이동, 없으면 기본 nextQuestionId
    nextQuestionId = selected.nextQuestionId ?? null;
  }

  // [422] 분기 위반: nextQuestionId가 존재하지만 실제 질문 목록에 없음
  // (샘플 JSON/분기 정의가 잘못되었거나, 클라이언트가 비정상 흐름으로 요청한 경우)
  if (nextQuestionId !== null && !data.find((q) => q.id === nextQuestionId)) {
    return NextResponse.json(
      { message: "Unprocessable: invalid nextQuestionId" },
      { status: 422 }
    );
  }

  // 6) 완료 판단: 다음 질문이 없으면 설문 완료
  const completed = nextQuestionId === null;

  // 완료된 세션은 Set에 기록하여 이후 제출을 403으로 차단
  if (completed) completedSessions.add(validSessionId);

  // 7) 응답: UI는 status/nextQuestionId/completed만으로 다음 화면 전환 가능
  return NextResponse.json({
    status: completed ? "completed" : "inProgress",
    nextQuestionId,
    completed,
  });
}

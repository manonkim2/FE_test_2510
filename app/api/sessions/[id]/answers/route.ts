import { NextResponse } from "next/server";
import surveys from "@/data/survey.json";
import { ISurveyOption, ISurveyQuestion } from "@/app/(survey)/_types/survey";

export interface IAnswerResponse {
  status: "completed" | "inProgress";
  nextQuestionId: string | null;
  completed: boolean;
}

export async function POST(
  req: Request
): Promise<NextResponse<IAnswerResponse>> {
  // 1) Body 파싱 (실패해도 빈 객체)
  const body = await req.json().catch(() => ({}));
  const questionId: string | undefined = body?.questionId;

  // 2) questionId 기반으로 다음 질문 찾기
  let nextQuestionId: string | null = "q1";

  const data = surveys.questions as ISurveyQuestion[];
  const question = data.find((q: ISurveyQuestion) => q.id === questionId);

  if (question) {
    if (question.type === "singleChoice" && body?.answer?.optionId) {
      const selected = question?.options?.find(
        (opt: ISurveyOption) => opt.id === body.answer.optionId
      );
      nextQuestionId =
        selected?.nextQuestionId !== undefined
          ? selected.nextQuestionId ?? null
          : question.nextQuestionId ?? null;
    } else {
      nextQuestionId = question.nextQuestionId ?? null;
    }
  }

  const completed = nextQuestionId === null;

  return NextResponse.json({
    status: completed ? "completed" : "inProgress",
    nextQuestionId,
    completed,
  });
}

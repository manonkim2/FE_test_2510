import { fetchWithErrorHandling } from "./fetchWithError";

interface IAnswerResponse {
  status: string;
  nextQuestionId: string;
  completed: boolean;
}

export const submitAnswer = async (
  questionId: string,
  answer?: {
    type: "singleChoice" | "multiChoice" | "text";
    optionId?: string | string[];
    text?: string | null;
  }
) => {
  const sessionId = localStorage.getItem("sessionId");
  const sessionToken = localStorage.getItem("sessionToken");

  if (!sessionId || !sessionToken) throw new Error("세션 정보 없음");

  const payload: Record<string, unknown> = {
    questionId,
    submittedAt: new Date().toISOString(),
  };

  if (answer) payload.answer = answer;

  return await fetchWithErrorHandling<IAnswerResponse>(
    `/api/sessions/${sessionId}/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": sessionToken,
      },
      body: JSON.stringify(payload),
    }
  );
};

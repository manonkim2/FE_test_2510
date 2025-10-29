import { IUserAnswer } from "../_types/answer";

export const submitAnswer = async (answer: IUserAnswer) => {
  const sessionId = localStorage.getItem("sessionId");
  const sessionToken = localStorage.getItem("sessionToken");

  if (!sessionId || !sessionToken) throw new Error("세션 정보 없음");

  const payload: Record<string, unknown> = {
    questionId: answer.questionId,
    submittedAt: new Date().toISOString(),
  };

  if (answer) payload.answer = answer;

  try {
    const res = await fetch(`/api/sessions/${sessionId}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": sessionToken,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("❌ 서버 오류:", errData);
      const message =
        typeof errData?.message === "string"
          ? errData.message
          : `요청 실패 (${res.status})`;
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ 요청 중 예외 발생:", err);
    throw err;
  }
};

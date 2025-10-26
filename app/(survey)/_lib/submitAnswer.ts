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
      throw new Error(errData.error || `요청 실패 (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ 요청 중 예외 발생:", err);
    throw err;
  }
};

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSurveyStore } from "../_store/useSurveyStore";
import QuestionMultiChoice from "../_components/QuestionMultiChoice";
import QuestionSingleChoice from "../_components/QuestionSingleChoice";
import QuestionText from "../_components/QuestionText";

const QuestionPage = () => {
  const router = useRouter();
  const { survey, getCurrentQuestion, updateAnswer } = useSurveyStore();
  const currentQuestion = getCurrentQuestion();

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    const token = localStorage.getItem("sessionToken");

    if (!sessionId) return;

    (async () => {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        headers: {
          "X-Session-Token": token || "",
        },
      });

      if (!res.ok) return;

      const savedProgress = localStorage.getItem("surveyProgress");

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed.status === "completed") {
          router.push("/completed");
          return;
        }

        updateAnswer({
          nextQuestionId: parsed.nextQuestionId,
          completed: parsed.status === "completed",
          answer: parsed.answers,
        });
      }
    })();
  }, [router, updateAnswer]);

  if (!survey)
    return <div className="p-8 text-red-500">설문 데이터가 없습니다.</div>;

  if (!currentQuestion) return null;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-2">{currentQuestion.text}</h1>
      {currentQuestion.required === false && (
        <p className="text-sm text-gray-500 mb-4">
          (선택하지 않아도 넘어갈 수 있습니다)
        </p>
      )}

      {currentQuestion.type === "text" && <QuestionText />}
      {currentQuestion.type === "multiChoice" && <QuestionMultiChoice />}
      {currentQuestion.type === "singleChoice" && <QuestionSingleChoice />}
    </div>
  );
};

export default QuestionPage;

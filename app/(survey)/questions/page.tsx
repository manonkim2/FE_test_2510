"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSurveyStore } from "../_store/useSurveyStore";
import QuestionMultiChoice from "../_components/QuestionMultiChoice";
import QuestionSingleChoice from "../_components/QuestionSingleChoice";
import QuestionText from "../_components/QuestionText";

const QuestionPage = () => {
  const router = useRouter();
  const { survey, getCurrentQuestion } = useSurveyStore();
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
    })();
  }, [router]);

  if (!survey)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <section className="w-full max-w-xl rounded-3xl border border-red-200 bg-surface px-8 py-10 text-center text-red-600 shadow-sm">
          설문 데이터가 없습니다.
        </section>
      </main>
    );

  if (!currentQuestion) return null;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-surface px-8 py-10 shadow-sm">
        <header className="space-y-3 mb-8">
          <span className="text-xs font-secondary uppercase tracking-[0.3em] text-brand">
            UNITBLACK SURVEY
          </span>
          <h1 className="text-2xl font-semibold leading-snug text-foreground">
            {currentQuestion.text}
          </h1>
          {currentQuestion.required === false && (
            <p className="text-sm text-gray-400 pt-1">
              답변하지 않아도 넘어갈 수 있습니다.
            </p>
          )}
        </header>

        <div>
          {currentQuestion.type === "text" && <QuestionText />}
          {currentQuestion.type === "multiChoice" && <QuestionMultiChoice />}
          {currentQuestion.type === "singleChoice" && <QuestionSingleChoice />}
        </div>
      </section>
    </main>
  );
};

export default QuestionPage;

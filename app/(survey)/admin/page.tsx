"use client";

import { useEffect, useState } from "react";

import { useSurveyStore } from "../_store/useSurveyStore";
import { StoredAnswer } from "../_types/answer";
import { ISaveSurvey } from "../_lib/storage";
import Spinner from "@/app/components/Spinner";

const AdminPage = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status, answers, survey } = useSurveyStore();
  const setSurvey = useSurveyStore((s) => s.setSurvey);
  const hydrateProgress = useSurveyStore((s) => s.hydrateProgress);

  useEffect(() => {
    let mounted = true;

    const loadSurvey = async () => {
      try {
        const storedSurveyId =
          localStorage.getItem("surveyId") ?? "join-reasons-2025";

        const res = await fetch(`/api/surveys/${storedSurveyId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const message =
            typeof errJson?.message === "string"
              ? errJson.message
              : `설문 로드 실패 (${res.status})`;
          if (mounted) setError(message);
          return;
        }

        const data = await res.json();
        if (!mounted) return;

        setSurvey(data);

        const saved = localStorage.getItem("surveyProgress");
        if (saved) {
          try {
            hydrateProgress(JSON.parse(saved) as ISaveSurvey);
          } catch (error) {
            console.error("surveyProgress parse 실패", error);
          }
        }
      } catch (error) {
        console.error("어드민 데이터 로드 실패", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "어드민 데이터 로드 중 알 수 없는 오류가 발생했습니다."
          );
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    loadSurvey();

    return () => {
      mounted = false;
    };
  }, [hydrateProgress, setSurvey]);

  if (!initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <Spinner label="설문 데이터를 불러오는 중입니다…" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-red-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-red-600">
            설문 데이터를 불러오는 데 실패했습니다.
          </h1>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </section>
      </main>
    );
  }

  if (status === "idle" || Object.keys(answers).length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-gray-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            진행 중인 설문이 없습니다.
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            메인 화면에서 설문을 시작하면 응답을 확인할 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  const getQuestionText = (id: string) =>
    survey?.questions.find((q) => q.id === id)?.text || id;

  const getAnswerLabel = (answer: StoredAnswer, questionId: string) => {
    const question = survey?.questions.find((q) => q.id === questionId);
    if (!answer) return "응답 없음";

    switch (answer.type) {
      case "singleChoice":
        if (!answer.optionId) return "선택하지 않음";
        return (
          question?.options?.find((opt) => opt.id === answer.optionId)?.label ||
          "선택지 없음"
        );
      case "multiChoice":
        if (!answer.optionIds?.length) return "선택하지 않음";
        return answer.optionIds
          .map(
            (optId: string) =>
              question?.options?.find((opt) => opt.id === optId)?.label || optId
          )
          .join(", ");
      case "text":
        return answer.text?.trim()
          ? answer.text
          : question?.required === false
          ? "답변을 입력하지 않았습니다."
          : "(빈 응답)";
      default:
        return JSON.stringify(answer);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-10">
      <div className="max-w-2xl w-full bg-white/95 shadow-md rounded-2xl p-8 border border-gray-100">
        <div className="mb-6 text-center">
          <p className="text-2xl font-semibold text-gray-800 mb-2">
            설문 진행 상황
          </p>
        </div>

        <div className="mb-4 text-center">
          <span className="inline-block bg-brand/10 text-brand font-medium px-4 py-1 rounded-full">
            {status === "completed" ? "설문 완료" : "진행중"}
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(answers).map(([questionId, answer]) => (
            <div
              key={questionId}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50"
            >
              <p className="font-semibold text-gray-800">
                Q. {getQuestionText(questionId)}
              </p>
              <p className="text-gray-600  mt-1">
                A. {getAnswerLabel(answer, questionId)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminPage;

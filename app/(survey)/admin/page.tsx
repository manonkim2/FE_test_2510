"use client";

import { useSurveyStore } from "../_store/useSurveyStore";
import { StoredAnswer } from "../_types/answer";

const AdminPage = () => {
  const { status, answers, survey } = useSurveyStore();

  if (status === "idle") {
    return (
      <main className="p-8 text-center">
        <h1 className="text-xl font-semibold">진행 중인 설문이 없습니다.</h1>
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
        return (
          question?.options?.find((opt) => opt.id === answer.optionId)?.label ||
          "선택지 없음"
        );
      case "multiChoice":
        return answer.optionIds
          ?.map(
            (optId: string) =>
              question?.options?.find((opt) => opt.id === optId)?.label || optId
          )
          .join(", ");
      case "text":
        return answer.text || "(빈 응답)";
      default:
        return JSON.stringify(answer);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 ">
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

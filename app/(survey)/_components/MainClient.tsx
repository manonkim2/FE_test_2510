"use client";

import { useEffect } from "react";

import StartButton from "./StartButton";
import AdminButton from "./AdminButton";
import { ISurvey } from "../_types/survey";
import { useSurveyStore } from "../_store/useSurveyStore";

const MainPage = ({ survey }: { survey: ISurvey }) => {
  const { updateAnswer, status, currentQuestionId } = useSurveyStore();

  const setSurvey = useSurveyStore((s) => s.setSurvey);

  useEffect(() => {
    setSurvey(survey);

    const savedProgress = localStorage.getItem("surveyProgress");
    if (!savedProgress) return;

    const isStoreEmpty = status === "idle" && !currentQuestionId;

    (async () => {
      if (isStoreEmpty) {
        const parsed = JSON.parse(savedProgress);

        updateAnswer({
          nextQuestionId: parsed.nextQuestionId,
          completed: parsed.status === "completed",
          answer: parsed.answers,
        });
      }
    })();
  }, [currentQuestionId, setSurvey, status, survey, updateAnswer]);

  return (
    <div className="mt-8 space-y-4 flex flex-col items-center">
      <div className="flex flex-col gap-3 sm:flex-row">
        <StartButton surveyId={survey.id} />
        <AdminButton
          progress={status === "completed" || status === "inProgress"}
        />
      </div>

      {status === "inProgress" && (
        <p className="text-sm text-gray-400">
          진행 중인 설문이 있습니다. (다음 질문: {currentQuestionId})
        </p>
      )}

      {status === "completed" && (
        <div className="mt-4 flex flex-col items-center gap-1 rounded-2xl border border-brand/30 px-5 py-4 text-sm text-brand shadow-sm animate-fade-in">
          <p className="font-medium">🎉 설문이 완료되었습니다. 🎉 </p>
          <p className="text-center text-gray-200">
            재응시는 불가하며, 어드민 페이지에서 응답을 조회하거나 수정할 수
            있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default MainPage;

"use client";

import { useEffect } from "react";

import StartButton from "./StartButton";
import AdminButton from "./AdminButton";
import { ISurvey } from "../_types/survey";
import { useSurveyStore } from "../_store/useSurveyStore";
import { useRouter } from "next/navigation";

const MainPage = ({ survey }: { survey: ISurvey }) => {
  const router = useRouter();

  const { updateAnswer, status, currentQuestionId } = useSurveyStore();
  const setSurvey = useSurveyStore((s) => s.setSurvey);

  useEffect(() => {
    setSurvey(survey);

    const savedProgress = localStorage.getItem("surveyProgress");

    (async () => {
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);

        updateAnswer({
          nextQuestionId: parsed.nextQuestionId,
          completed: parsed.status === "completed",
          answer: parsed.answers,
        });
      }
    })();
  }, [router, setSurvey, survey, updateAnswer]);

  return (
    <div>
      <div className="flex gap-4">
        <StartButton surveyId={survey.id} disabled={status === "completed"} />
        <AdminButton
          progress={status === "completed" || status === "inProgress"}
        />
      </div>

      {status === "inProgress" && (
        <p className="mt-3 text-sm text-gray-500">
          진행 중인 설문이 있습니다. (다음 질문: {currentQuestionId})
        </p>
      )}

      {status === "completed" && (
        <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
          이미 설문을 완료하셨습니다. 재응시는 불가합니다. 필요 시 어드민에서
          응답을 조회/수정하세요.
        </div>
      )}
    </div>
  );
};

export default MainPage;

"use client";

import { useRouter } from "next/navigation";
import { ISurvey } from "../_types/survey";
import { useSurveyStore } from "../_store/useSurveyStore";

const StartButton = ({ survey }: { survey: ISurvey }) => {
  const router = useRouter();
  const setSurvey = useSurveyStore((s) => s.setSurvey);

  const handleStart = async () => {
    setSurvey(survey);

    let token = localStorage.getItem("sessionToken");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("sessionToken", token);
    }

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": token,
      },
      body: JSON.stringify({ surveyId: survey.id }),
    });

    if (!res.ok) {
      alert("세션 생성에 실패했습니다.");
      return;
    }

    const data = await res.json();

    router.push(`/questions?sessionId=${data.sessionId}`);
  };

  return (
    <button
      onClick={handleStart}
      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 border cursor-pointer"
    >
      테스트 시작하기
    </button>
  );
};

export default StartButton;

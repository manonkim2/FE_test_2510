"use client";

import { useRouter } from "next/navigation";

import { useSurveyStore } from "../_store/useSurveyStore";
import Button from "@/app/components/Button";

const StartButton = ({ surveyId }: { surveyId: string }) => {
  const router = useRouter();
  const { status } = useSurveyStore();
  const complete = status === "completed";

  const handleStart = async () => {
    if (complete) return;

    try {
      const token = localStorage.getItem("sessionToken") ?? crypto.randomUUID();
      localStorage.setItem("sessionToken", token);

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": token,
        },
        body: JSON.stringify({ surveyId }),
      });

      if (!res.ok) throw new Error("세션 생성 실패");

      const data = await res.json();
      localStorage.setItem("sessionId", data.sessionId);

      router.push("/questions");
    } catch (err) {
      console.error(err);
      alert("세션 생성 중 오류가 발생했습니다.");
    }
  };

  const buttonText =
    status === "completed"
      ? "설문 완료"
      : status === "inProgress"
      ? "이어서 진행하기"
      : "설문 시작하기";

  return <Button onClick={handleStart} disabled={complete} text={buttonText} />;
};

export default StartButton;

"use client";

import { useRouter } from "next/navigation";

const StartButton = ({
  surveyId,
  disabled = false,
}: {
  surveyId: string;
  disabled?: boolean;
}) => {
  const router = useRouter();

  const handleStart = async () => {
    if (disabled) return;

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

  return (
    <button
      onClick={handleStart}
      disabled={disabled}
      aria-disabled={disabled}
      title={
        disabled
          ? "이미 완료된 세션입니다. 재응시는 불가합니다."
          : "설문 시작하기"
      }
      className={`px-6 py-3 rounded-lg border ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-black text-white hover:bg-gray-800"
      }`}
    >
      {disabled ? "설문 완료됨" : "설문 시작하기"}
    </button>
  );
};

export default StartButton;

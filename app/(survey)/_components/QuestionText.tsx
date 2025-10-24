"use client";

import { useState } from "react";

import { useSurveyStore } from "../_store/useSurveyStore";
import { submitAnswer } from "../_lib/submitAnswer";
import Button from "@/components/Button";

const QuestionText = () => {
  const [text, setText] = useState("");

  const { getCurrentQuestion } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;

  const isFinal = question.id === "q8_final";

  const handleOnClick = async () => {
    const trimmed = text.trim();
    const answerValue = trimmed.length > 0 ? trimmed : null;

    try {
      await submitAnswer(question.id, { type: "text", text: answerValue });

      setText("");
    } catch (error) {
      alert("답변 제출에 실패했습니다. 다시 시도해주세요.");
      console.error(error);
    }
  };

  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="답변을 입력하세요"
        className="border rounded-lg w-full px-3 py-2 mb-4"
      />

      <Button
        onClick={handleOnClick}
        disabled={question.required !== false && !text.trim()}
        text={isFinal ? "제출하기" : "다음"}
      />
    </>
  );
};

export default QuestionText;

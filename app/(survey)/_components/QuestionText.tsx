"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSurveyStore } from "../_store/useSurveyStore";
import { submitAnswer } from "../_lib/submitAnswer";
import Button from "@/components/Button";
import { IAnswerResponse } from "@/app/api/sessions/[id]/answers/route";

const QuestionText = () => {
  const router = useRouter();
  const [text, setText] = useState("");

  const { getCurrentQuestion, updateAnswer } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;

  const handleOnClick = async () => {
    const trimmed = text.trim();
    const answerValue = trimmed.length > 0 ? trimmed : null;

    try {
      const res: IAnswerResponse = await submitAnswer(question.id, {
        type: "text",
        text: answerValue,
      });

      updateAnswer(res);
      setText("");

      if (res.completed) {
        router.push("/completed");
        return;
      }
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
        text={!question.nextQuestionId ? "제출하기" : "다음"}
      />
    </>
  );
};

export default QuestionText;

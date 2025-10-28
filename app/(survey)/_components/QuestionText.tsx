"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { useSurveyStore } from "../_store/useSurveyStore";
import { submitAnswer } from "../_lib/submitAnswer";
import { IUserAnswer } from "../_types/answer";

const QuestionText = () => {
  const router = useRouter();
  const [text, setText] = useState("");

  const { getCurrentQuestion, updateAnswer } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;

  const handleOnClick = async () => {
    const trimmed = text.trim();
    const answerValue = trimmed.length > 0 ? trimmed : null;

    const answer = {
      questionId: question.id,
      type: "text",
      text: answerValue,
    } as IUserAnswer;

    try {
      const res = await submitAnswer(answer);

      updateAnswer({
        nextQuestionId: res.nextQuestionId,
        completed: res.completed,
        answer,
      });
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
    <div className="space-y-6">
      <div className="space-y-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="답변을 입력하세요"
          className="w-full rounded-2xl border border-gray-200 bg-surface px-4 py-3 text-base transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <Button
        onClick={handleOnClick}
        disabled={question.required !== false && !text.trim()}
        text={!question.nextQuestionId ? "제출하기" : "다음"}
      />
    </div>
  );
};

export default QuestionText;

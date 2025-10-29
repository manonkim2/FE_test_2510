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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getCurrentQuestion, updateAnswer } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;
  const maxLength = question.maxLength;

  const handleOnClick = async () => {
    const trimmed = text.trim();
    const answerValue = trimmed.length > 0 ? trimmed : null;

    if (question.required !== false && !answerValue) {
      setError("답변을 입력해주세요.");
      return;
    }
    if (maxLength && answerValue && answerValue.length > maxLength) {
      setError(`최대 ${maxLength}자까지 입력할 수 있습니다.`);
      return;
    }

    const answer = {
      questionId: question.id,
      type: "text",
      text: answerValue,
    } as IUserAnswer;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await submitAnswer(answer);

      updateAnswer({
        nextQuestionId: res.nextQuestionId,
        completed: res.completed,
        answer: answerValue ? answer : undefined,
      });
      setText("");

      if (res.completed) {
        router.push("/completed");
        return;
      }
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "답변 제출에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const value = maxLength
              ? e.target.value.slice(0, maxLength)
              : e.target.value;
            setText(value);
            if (error) setError(null);
          }}
          placeholder="답변을 입력하세요"
          maxLength={maxLength}
          disabled={isSubmitting}
          className="w-full rounded-2xl border border-gray-200 bg-surface px-4 py-3 text-base transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        {maxLength && (
          <p className="text-xs text-gray-400">
            {text.trim().length}/{maxLength}자
          </p>
        )}
        <p className="text-xs text-gray-500">
          간단하게 생각나는 답을 적어주세요.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}

      <Button
        onClick={handleOnClick}
        disabled={isSubmitting}
        text={
          isSubmitting
            ? "전송 중..."
            : !question.nextQuestionId
            ? "제출하기"
            : "다음"
        }
      />
    </div>
  );
};

export default QuestionText;

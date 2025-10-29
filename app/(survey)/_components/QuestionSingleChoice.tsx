"use client";

import { useState } from "react";

import Button from "@/components/Button";
import { useSurveyStore } from "../_store/useSurveyStore";
import { ISurveyOption } from "../_types/survey";
import { submitAnswer } from "../_lib/submitAnswer";
import { IUserAnswer } from "../_types/answer";

const QuestionSingleChoice = () => {
  const [selectedOption, setSelectedOption] = useState<ISurveyOption | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getCurrentQuestion, updateAnswer } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;

  const handleNextButton = async () => {
    if (question.required !== false && !selectedOption?.id) {
      setError("답변을 선택해주세요.");
      return;
    }

    const hasSelection = Boolean(selectedOption?.id);
    const answer = {
      questionId: question.id,
      type: "singleChoice",
      ...(hasSelection ? { optionId: selectedOption?.id } : {}),
    } as IUserAnswer;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await submitAnswer(answer);

      updateAnswer({
        nextQuestionId: res.nextQuestionId,
        completed: res.completed,
        answer: hasSelection ? answer : undefined,
      });
      setSelectedOption(null);
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
      <div className="space-y-3">
        {question.options?.map((opt) => {
          const isSelected = selectedOption?.id === opt.id;

          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-brand bg-brand/5 shadow-sm"
                  : "border-gray-200 hover:border-brand/50 hover:bg-brand/5"
              }`}
            >
              <input
                type="radio"
                name="singleChoice"
                value={opt.id}
                checked={isSelected}
                onChange={() => {
                  setSelectedOption(opt);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-base text-foreground">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}

      <Button
        onClick={handleNextButton}
        disabled={isSubmitting}
        text={isSubmitting ? "전송 중..." : "다음"}
      />
    </div>
  );
};

export default QuestionSingleChoice;

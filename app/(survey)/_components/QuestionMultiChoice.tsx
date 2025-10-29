"use client";

import { useState } from "react";

import Button from "@/components/Button";
import { useSurveyStore } from "../_store/useSurveyStore";
import { submitAnswer } from "../_lib/submitAnswer";
import { IUserAnswer } from "../_types/answer";

const QuestionMultiChoice = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getCurrentQuestion, updateAnswer } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;

  const minSelect = question.minSelect ?? (question.required !== false ? 1 : 0);
  const maxSelect = question.maxSelect;

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(id)) {
        setError(null);
        return prev.filter((opt) => opt !== id);
      }

      if (typeof maxSelect === "number" && prev.length >= maxSelect) {
        setError(`최대 ${maxSelect}개까지 선택할 수 있습니다.`);
        return prev;
      }

      setError(null);
      return [...prev, id];
    });
  };

  const handleNextButton = async () => {
    if (selectedOptions.length < minSelect) {
      setError(
        minSelect > 0
          ? `${minSelect}개 이상 선택해주세요.`
          : "선택하지 않아도 됩니다."
      );
      return;
    }

    const hasSelection = selectedOptions.length > 0;
    const answer = {
      questionId: question.id,
      type: "multiChoice",
      optionIds: selectedOptions,
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

      setSelectedOptions([]);
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
      <div className="text-sm flex">
        <p className="pr-1">복수 선택 가능합니다.</p>
        {(minSelect > 0 || typeof maxSelect === "number") && (
          <p>
            ({minSelect > 0 ? `${minSelect}개 이상` : "최소 제한 없음"}
            {typeof maxSelect === "number"
              ? ` · 최대 ${maxSelect}개`
              : " · 제한 없음"}
            )
          </p>
        )}
      </div>

      <div className="space-y-3">
        {question.options?.map((opt) => {
          const isChecked = selectedOptions.includes(opt.id);

          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                isChecked
                  ? "border-brand bg-brand/5 shadow-sm"
                  : "border-gray-200 hover:border-brand/50 hover:bg-brand/5"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleOption(opt.id)}
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

export default QuestionMultiChoice;

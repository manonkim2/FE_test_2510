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
  const { getCurrentQuestion, updateAnswer } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;

  const handleNextButton = async () => {
    if (!selectedOption?.id) return;

    const answer = {
      questionId: question.id,
      type: "singleChoice",
      optionId: selectedOption.id,
    } as IUserAnswer;

    try {
      const res = await submitAnswer(answer);

      updateAnswer({
        nextQuestionId: res.nextQuestionId,
        completed: res.completed,
        answer,
      });
      setSelectedOption(null);
    } catch (error) {
      alert("답변 제출에 실패했습니다. 다시 시도해주세요.");
      console.error(error);
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
                onChange={() => setSelectedOption(opt)}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-base text-foreground">{opt.label}</span>
            </label>
          );
        })}
      </div>

      <Button
        onClick={handleNextButton}
        disabled={question.required !== false && !selectedOption}
      />
    </div>
  );
};

export default QuestionSingleChoice;

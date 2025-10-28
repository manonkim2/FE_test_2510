"use client";

import { useState } from "react";

import Button from "@/components/Button";
import { useSurveyStore } from "../_store/useSurveyStore";
import { submitAnswer } from "../_lib/submitAnswer";
import { IUserAnswer } from "../_types/answer";

const QuestionMultiChoice = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const { getCurrentQuestion, updateAnswer } = useSurveyStore();
  const question = getCurrentQuestion();
  if (!question) return null;

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
    );
  };

  const handleNextButton = async () => {
    const answer = {
      questionId: question.id,
      type: "multiChoice",
      optionIds: selectedOptions,
    } as IUserAnswer;

    try {
      const res = await submitAnswer(answer);

      updateAnswer({
        nextQuestionId: res.nextQuestionId,
        completed: res.completed,
        answer,
      });

      setSelectedOptions([]);
    } catch (error) {
      alert("답변 제출에 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
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
                className="h-4 w-4 accent-brand"
              />
              <span className="text-base text-foreground">{opt.label}</span>
            </label>
          );
        })}
      </div>

      <Button
        onClick={handleNextButton}
        disabled={question.required !== false && selectedOptions.length === 0}
      />
    </div>
  );
};

export default QuestionMultiChoice;

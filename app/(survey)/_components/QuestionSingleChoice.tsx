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
    <>
      <div className="flex flex-col gap-3 mb-6">
        {question.options?.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 border p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="radio"
              name="singleChoice"
              value={opt.id}
              checked={selectedOption?.id === opt.id}
              onChange={() => setSelectedOption(opt)}
              className="mr-2"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <Button
        onClick={handleNextButton}
        disabled={question.required !== false && !selectedOption}
      />
    </>
  );
};

export default QuestionSingleChoice;

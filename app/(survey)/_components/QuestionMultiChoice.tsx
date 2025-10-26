"use client";

import { useState } from "react";

import { useSurveyStore } from "../_store/useSurveyStore";
import { submitAnswer } from "../_lib/submitAnswer";
import Button from "@/components/Button";

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
    try {
      const res = await submitAnswer(question.id, {
        type: "multiChoice",
        optionId: selectedOptions,
      });

      updateAnswer(res);
      setSelectedOptions([]);
    } catch (error) {
      alert("답변 제출에 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <>
      <p className="text-gray-500 text-sm mb-2">(여러 개 선택 가능합니다)</p>

      <div className="flex flex-col gap-3 mb-6">
        {question.options?.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 border p-2 rounded hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(opt.id)}
              onChange={() => toggleOption(opt.id)}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <Button
        onClick={handleNextButton}
        disabled={question.required !== false && selectedOptions.length === 0}
      />
    </>
  );
};

export default QuestionMultiChoice;

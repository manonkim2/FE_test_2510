"use client";

import { useSurveyStore } from "../_store/useSurveyStore";

import QuestionMultiChoice from "../_components/QuestionMultiChoice";
import QuestionSingleChoice from "../_components/QuestionSingleChoice";
import QuestionText from "../_components/QuestionText";

const QuestionPage = () => {
  const { survey, getCurrentQuestion } = useSurveyStore();
  const currentQuestion = getCurrentQuestion();

  if (!survey)
    return <div className="p-8 text-red-500">설문 데이터가 없습니다.</div>;

  if (!currentQuestion) return null;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-2">{currentQuestion.text}</h1>
      {currentQuestion.required === false && (
        <p className="text-sm text-gray-500 mb-4">
          (선택하지 않아도 넘어갈 수 있습니다)
        </p>
      )}

      {currentQuestion.type === "text" && <QuestionText />}
      {currentQuestion.type === "multiChoice" && <QuestionMultiChoice />}
      {currentQuestion.type === "singleChoice" && <QuestionSingleChoice />}
    </div>
  );
};

export default QuestionPage;

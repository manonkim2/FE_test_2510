"use client";

import AdminAnswerEditor, {
  AdminEditorCloseReason,
} from "./AdminAnswerEditor";
import { StoredAnswer } from "@/app/(survey)/_types/answer";
import { ISurveyQuestion } from "@/app/(survey)/_types/survey";

interface AdminQuestionListProps {
  questions: ISurveyQuestion[];
  answers: Record<string, StoredAnswer>;
  canEdit: boolean;
  editingQuestionId: string | null;
  onStartEditing: (questionId: string) => void;
  onCloseEditing: (
    questionId: string,
    reason: AdminEditorCloseReason
  ) => void;
}

const getAnswerLabel = (
  answer: StoredAnswer | undefined,
  question: ISurveyQuestion
) => {
  if (!answer) return "응답 없음";

  switch (answer.type) {
    case "singleChoice":
      if (!answer.optionId) return "선택하지 않음";
      return (
        question.options?.find((opt) => opt.id === answer.optionId)?.label ??
        "선택지 없음"
      );
    case "multiChoice":
      if (!answer.optionIds?.length) return "선택하지 않음";
      return answer.optionIds
        .map(
          (optId) =>
            question.options?.find((opt) => opt.id === optId)?.label ?? optId
        )
        .join(", ");
    case "text":
      return answer.text?.trim()
        ? answer.text
        : question.required === false
        ? "답변을 입력하지 않았습니다."
        : "(빈 응답)";
    default:
      return JSON.stringify(answer);
  }
};

const AdminQuestionList = ({
  questions,
  answers,
  canEdit,
  editingQuestionId,
  onStartEditing,
  onCloseEditing,
}: AdminQuestionListProps) => {
  if (!questions.length) return null;

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const answer = answers[question.id];
        const isEditing = canEdit && editingQuestionId === question.id;
        const cardClass = [
          "rounded-xl border p-4 transition-shadow",
          isEditing
            ? "border-brand bg-brand/5 shadow-md shadow-brand/10"
            : "border-gray-200 bg-gray-50",
        ].join(" ");

        return (
          <div key={question.id} className={cardClass}>
            <p className="font-semibold text-gray-800">Q. {question.text}</p>

            {isEditing ? (
              <AdminAnswerEditor
                question={question}
                answer={answer}
                disabled={!canEdit}
                onClose={(reason) => onCloseEditing(question.id, reason)}
              />
            ) : (
              <>
                <p className="mt-1 text-gray-600">
                  A. {getAnswerLabel(answer, question)}
                </p>
                {canEdit && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onStartEditing(question.id)}
                      className="rounded-lg border border-brand px-3 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                    >
                      수정
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminQuestionList;

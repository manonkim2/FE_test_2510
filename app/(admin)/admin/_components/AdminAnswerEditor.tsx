"use client";

import { useEffect, useState } from "react";

import { useSurveyStore } from "@/app/(survey)/_store/useSurveyStore";
import { StoredAnswer } from "@/app/(survey)/_types/answer";
import { ISurveyQuestion } from "@/app/(survey)/_types/survey";

export type AdminEditorCloseReason = "saved" | "cancelled";

interface AdminAnswerEditorProps {
  question: ISurveyQuestion;
  answer: StoredAnswer | undefined;
  disabled?: boolean;
  onClose: (reason: AdminEditorCloseReason) => void;
}

const AdminAnswerEditor = ({
  question,
  answer,
  disabled = false,
  onClose,
}: AdminAnswerEditorProps) => {
  const setStoredAnswer = useSurveyStore((s) => s.setStoredAnswer);
  const [textValue, setTextValue] = useState(
    answer?.type === "text" ? answer.text ?? "" : ""
  );
  const [singleChoice, setSingleChoice] = useState(
    answer?.type === "singleChoice" ? answer.optionId ?? "" : ""
  );
  const [multiChoices, setMultiChoices] = useState<Set<string>>(
    () => new Set(answer?.type === "multiChoice" ? answer.optionIds ?? [] : [])
  );

  useEffect(() => {
    setTextValue(answer?.type === "text" ? answer.text ?? "" : "");
    setSingleChoice(
      answer?.type === "singleChoice" ? answer.optionId ?? "" : ""
    );
    setMultiChoices(
      new Set(answer?.type === "multiChoice" ? answer.optionIds ?? [] : [])
    );
  }, [answer, question.id, question.type]);

  const handleToggleOption = (optionId: string) => {
    if (disabled) return;

    setMultiChoices((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        if (
          typeof question.maxSelect === "number" &&
          question.maxSelect > 0 &&
          next.size >= question.maxSelect
        ) {
          return prev;
        }
        next.add(optionId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (disabled) return;

    let nextAnswer: StoredAnswer = null;

    if (question.type === "text") {
      nextAnswer = { type: "text", text: textValue.trim() };
    } else if (question.type === "singleChoice") {
      nextAnswer = singleChoice
        ? { type: "singleChoice", optionId: singleChoice }
        : null;
    } else if (question.type === "multiChoice") {
      nextAnswer = {
        type: "multiChoice",
        optionIds: Array.from(multiChoices),
      };
    }

    setStoredAnswer(question.id, nextAnswer);
    onClose("saved");
  };

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      {question.type === "text" && (
        <textarea
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-gray-100"
          rows={4}
          placeholder="응답 내용을 입력하세요."
        />
      )}

      {question.type === "singleChoice" && (
        <div className="space-y-2">
          {question.options?.length ? (
            question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 hover:border-brand/40"
              >
                <input
                  type="radio"
                  name={`single-${question.id}`}
                  value={option.id}
                  checked={singleChoice === option.id}
                  onChange={(event) => setSingleChoice(event.target.value)}
                  disabled={disabled}
                  className="h-4 w-4 text-brand focus:ring-brand disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-400">선택지가 없습니다.</p>
          )}
        </div>
      )}

      {question.type === "multiChoice" && (
        <div className="space-y-2">
          {question.options?.length ? (
            question.options.map((option) => {
              const checked = multiChoices.has(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 hover:border-brand/40"
                >
                  <input
                    type="checkbox"
                    value={option.id}
                    checked={checked}
                    onChange={() => handleToggleOption(option.id)}
                    disabled={disabled}
                    className="h-4 w-4 text-brand focus:ring-brand disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              );
            })
          ) : (
            <p className="text-sm text-gray-400">선택지가 없습니다.</p>
          )}

          {(question.minSelect || question.maxSelect) && (
            <p className="text-xs text-gray-400">
              {[
                question.minSelect ? `최소 ${question.minSelect}개` : null,
                question.maxSelect ? `최대 ${question.maxSelect}개` : null,
              ]
                .filter((text): text is string => Boolean(text))
                .join(" · ")}{" "}
              선택 가능합니다.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onClose("cancelled")}
          disabled={disabled}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled}
          className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default AdminAnswerEditor;

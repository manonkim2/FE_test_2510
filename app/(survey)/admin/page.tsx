"use client";

import { useEffect, useMemo, useState } from "react";

import { useSurveyStore } from "../_store/useSurveyStore";
import { StoredAnswer } from "../_types/answer";
import { ISaveSurvey } from "../_lib/storage";
import { ISurveyQuestion, ISurvey } from "../_types/survey";
import Spinner from "@/app/components/Spinner";

const getNextQuestionId = (
  question: ISurveyQuestion,
  answer: StoredAnswer | undefined
) => {
  if (!answer) return question.nextQuestionId ?? null;

  if (
    question.type === "singleChoice" &&
    answer?.type === "singleChoice" &&
    answer.optionId
  ) {
    const matched = question.options?.find(
      (option) => option.id === answer.optionId
    );
    if (matched) {
      return matched.nextQuestionId ?? question.nextQuestionId ?? null;
    }
  }

  return question.nextQuestionId ?? null;
};

const buildQuestionPath = (
  survey: ISurvey,
  answers: Record<string, StoredAnswer>
) => {
  const path: ISurveyQuestion[] = [];
  const visited = new Set<string>();
  let pointer = survey.startQuestionId ?? null;

  while (pointer) {
    if (visited.has(pointer)) break;
    visited.add(pointer);

    const question = survey.questions.find((q) => q.id === pointer);
    if (!question) break;

    path.push(question);

    const answer = answers[pointer];
    if (!answer) break;

    const nextId = getNextQuestionId(question, answer);
    if (!nextId) break;

    pointer = nextId;
  }

  return path;
};

interface AdminAnswerEditorProps {
  question: ISurveyQuestion;
  answer: StoredAnswer | undefined;
  disabled?: boolean;
  onClose: () => void;
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
    onClose();
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
          onClick={onClose}
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

const AdminPage = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const { status, answers, survey } = useSurveyStore();
  const setSurvey = useSurveyStore((s) => s.setSurvey);
  const hydrateProgress = useSurveyStore((s) => s.hydrateProgress);
  const canEdit = status !== "idle";
  const visibleQuestions = useMemo(
    () => (survey ? buildQuestionPath(survey, answers) : []),
    [answers, survey]
  );
  const hasPendingAnswers = useMemo(
    () => visibleQuestions.some((question) => !answers[question.id]),
    [answers, visibleQuestions]
  );
  const editingPulseActive =
    canEdit &&
    (status === "inProgress" ||
      hasPendingAnswers ||
      editingQuestionId !== null);
  const answeredCount = useMemo(
    () =>
      visibleQuestions.filter((question) => Boolean(answers[question.id]))
        .length,
    [answers, visibleQuestions]
  );
  const progressPercent = visibleQuestions.length
    ? Math.round((answeredCount / visibleQuestions.length) * 100)
    : 0;

  useEffect(() => {
    let mounted = true;

    const loadSurvey = async () => {
      try {
        const storedSurveyId =
          localStorage.getItem("surveyId") ?? "join-reasons-2025";

        const res = await fetch(`/api/surveys/${storedSurveyId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const message =
            typeof errJson?.message === "string"
              ? errJson.message
              : `설문 로드 실패 (${res.status})`;
          if (mounted) setError(message);
          return;
        }

        const data = await res.json();
        if (!mounted) return;

        setSurvey(data);

        const saved = localStorage.getItem("surveyProgress");
        if (saved) {
          try {
            hydrateProgress(JSON.parse(saved) as ISaveSurvey);
          } catch (error) {
            console.error("surveyProgress parse 실패", error);
          }
        }
      } catch (error) {
        console.error("어드민 데이터 로드 실패", error);
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "어드민 데이터 로드 중 알 수 없는 오류가 발생했습니다."
          );
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    loadSurvey();

    return () => {
      mounted = false;
    };
  }, [hydrateProgress, setSurvey]);

  useEffect(() => {
    if (!canEdit && editingQuestionId !== null) {
      setEditingQuestionId(null);
    }
  }, [canEdit, editingQuestionId]);

  useEffect(() => {
    if (!canEdit) return;
    if (!visibleQuestions.length) return;

    if (
      editingQuestionId &&
      !visibleQuestions.some((question) => question.id === editingQuestionId)
    ) {
      setEditingQuestionId(null);
      return;
    }

    if (editingQuestionId !== null) return;

    const firstUnanswered = visibleQuestions.find(
      (question) => !answers[question.id]
    );

    if (firstUnanswered) {
      setEditingQuestionId(firstUnanswered.id);
    }
  }, [answers, canEdit, editingQuestionId, visibleQuestions]);

  if (!initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <Spinner label="설문 데이터를 불러오는 중입니다…" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-red-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-red-600">
            설문 데이터를 불러오는 데 실패했습니다.
          </h1>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </section>
      </main>
    );
  }

  const hasAnswers = Object.keys(answers).length > 0;
  const statusBadgeLabel =
    status === "completed"
      ? "설문 완료"
      : status === "error"
      ? "분기 오류"
      : "진행중";

  if (!survey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-gray-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            설문 데이터를 찾을 수 없습니다.
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            새로고침 후에도 문제가 계속되면 다시 시도해 주세요.
          </p>
        </section>
      </main>
    );
  }

  if (status === "idle" && !hasAnswers) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-gray-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            진행 중인 설문이 없습니다.
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            메인 화면에서 설문을 시작하면 응답을 확인할 수 있습니다.
          </p>
        </section>
      </main>
    );
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

  const containerClass = [
    "relative max-w-2xl w-full rounded-2xl border bg-white/95 p-8 shadow-md transition",
    editingPulseActive
      ? "border-brand/40 shadow-brand/20 ring-2 ring-brand/30"
      : "border-gray-100",
  ].join(" ");

  return (
    <main
      className={`min-h-screen w-full bg-background px-4 py-10 sm:px-6 ${
        editingPulseActive
          ? "bg-linear-to-b from-brand/5 via-transparent to-background"
          : ""
      }`}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className={`${containerClass} space-y-6`}>
          {editingPulseActive && (
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-brand/5 blur-2xl" />
          )}

          <div className="px-5 py-1 text-center backdrop-blur-sm">
            <p className="text-lg font-semibold text-gray-700">
              현재 설문 진행 상태
            </p>
            <span className="mt-2 inline-block rounded-full bg-brand/10 px-4 py-1 text-xs font-medium text-brand">
              {statusBadgeLabel}
            </span>
          </div>
          <div className="sticky top-4 z-20 space-y-4">
            {editingPulseActive && visibleQuestions.length > 0 && (
              <div className="rounded-2xl bg-brand border border-brand/30 px-4 py-3 shadow-sm backdrop-blur-xl animate-pulse [animation-duration:3s]">
                <div className="flex items-center justify-between text-xs font-medium text-white">
                  <span>
                    응답 완료 {answeredCount}/{visibleQuestions.length}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/70 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {status === "inProgress" && (
            <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-center text-xs text-amber-700">
              분기 변경으로 추가 응답이 필요합니다. 아래에서 바로 이어서 입력해
              주세요.
            </p>
          )}

          {status === "error" && (
            <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-center text-xs text-red-600">
              분기 정보에 오류가 감지되었습니다. 문항 응답을 다시 확인하거나
              분기 설정을 검토해 주세요.
            </p>
          )}

          {!visibleQuestions.length && (
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
              아직 저장된 응답이 없습니다.
            </p>
          )}

          <div className="space-y-4">
            {visibleQuestions.map((question) => {
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
                  <p className="font-semibold text-gray-800">
                    Q. {question.text}
                  </p>

                  {isEditing ? (
                    <AdminAnswerEditor
                      question={question}
                      answer={answer}
                      disabled={!canEdit}
                      onClose={() => setEditingQuestionId(null)}
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
                            onClick={() =>
                              canEdit && setEditingQuestionId(question.id)
                            }
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
        </div>
      </div>
    </main>
  );
};

export default AdminPage;

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  SurveyStore,
  useSurveyStore,
} from "@/app/(survey)/_store/useSurveyStore";
import { ISaveSurvey } from "@/app/(survey)/_lib/storage";
import { buildQuestionPath } from "@/app/(survey)/_lib/navigation";
import type { ISurvey } from "@/app/(survey)/_types/survey";
import { isAdminEditableStatus, SurveyStatus } from "../_utils/utils";
import type { AdminEditorCloseReason } from "../_components/AdminAnswerEditor";

interface UseAdminSurveyResult {
  initialized: boolean;
  error: string | null;
  status: SurveyStatus;
  surveyLoaded: boolean;
  answers: SurveyStore["answers"];
  canEdit: boolean;
  visibleQuestions: ReturnType<typeof buildQuestionPath>;
  editingQuestionId: string | null;
  editingPulseActive: boolean;
  answeredCount: number;
  progressPercent: number;
  statusBadgeLabel: string;
  hasAnswers: boolean;
  handleStartEditing: (questionId: string) => void;
  handleCloseEditing: (
    questionId: string,
    reason: AdminEditorCloseReason
  ) => void;
}

export const useAdminSurvey = (
  initialSurvey: ISurvey | null,
  initialError: string | null = null
): UseAdminSurveyResult => {
  const [initialized, setInitialized] = useState(false);
  const [error, _] = useState<string | null>(initialError);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [lastEditedQuestionId, setLastEditedQuestionId] = useState<
    string | null
  >(null);

  const { status, answers, survey } = useSurveyStore();
  const setSurvey = useSurveyStore((s) => s.setSurvey);
  const hydrateProgress = useSurveyStore((s) => s.hydrateProgress);

  useEffect(() => {
    if (initialError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialized(true);
      return;
    }

    if (!initialSurvey) {
      setInitialized(true);
      return;
    }

    setSurvey(initialSurvey);

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("surveyProgress");
      if (saved) {
        try {
          hydrateProgress(JSON.parse(saved) as ISaveSurvey);
        } catch (hydrationError) {
          console.error("surveyProgress parse 실패", hydrationError);
        }
      }
    }

    setInitialized(true);
  }, [hydrateProgress, initialError, initialSurvey, setSurvey]);

  const canEdit = isAdminEditableStatus(status);
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

  const handleStartEditing = useCallback(
    (questionId: string) => {
      if (!canEdit) return;
      setEditingQuestionId(questionId);
    },
    [canEdit]
  );

  const handleCloseEditing = useCallback(
    (questionId: string, reason: AdminEditorCloseReason) => {
      setEditingQuestionId(null);
      if (reason === "saved") {
        setLastEditedQuestionId(questionId);
      } else {
        setLastEditedQuestionId(null);
      }
    },
    []
  );

  useEffect(() => {
    if (!canEdit) {
      if (editingQuestionId !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditingQuestionId(null);
      }
      if (lastEditedQuestionId !== null) {
        setLastEditedQuestionId(null);
      }
      return;
    }

    if (
      editingQuestionId &&
      !visibleQuestions.some((question) => question.id === editingQuestionId)
    ) {
      setEditingQuestionId(null);
      return;
    }

    if (editingQuestionId !== null) return;
    if (!lastEditedQuestionId) return;

    const firstUnanswered = visibleQuestions.find(
      (question) => !answers[question.id]
    );

    if (firstUnanswered && firstUnanswered.id !== lastEditedQuestionId) {
      setEditingQuestionId(firstUnanswered.id);
      setLastEditedQuestionId(null);
      return;
    }

    const lastEditedIndex = visibleQuestions.findIndex(
      (question) => question.id === lastEditedQuestionId
    );

    if (lastEditedIndex >= 0) {
      const nextQuestion = visibleQuestions[lastEditedIndex + 1];
      if (nextQuestion) {
        setEditingQuestionId(nextQuestion.id);
        setLastEditedQuestionId(null);
        return;
      }
    }

    setLastEditedQuestionId(null);
  }, [
    answers,
    canEdit,
    editingQuestionId,
    lastEditedQuestionId,
    visibleQuestions,
  ]);

  const hasAnswers = Object.keys(answers).length > 0;
  const statusBadgeLabel =
    status === "completed"
      ? "설문 완료"
      : status === "error"
      ? "분기 오류"
      : "진행중";

  return {
    initialized,
    error,
    status,
    surveyLoaded: Boolean(survey ?? initialSurvey),
    answers,
    canEdit,
    visibleQuestions,
    editingQuestionId,
    editingPulseActive,
    answeredCount,
    progressPercent,
    statusBadgeLabel,
    hasAnswers,
    handleStartEditing,
    handleCloseEditing,
  };
};

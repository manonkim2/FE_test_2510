import { create } from "zustand";
import { ISurvey, ISurveyQuestion } from "../_types/survey";
import { IUserAnswer, StoredAnswer } from "../_types/answer";
import { ISaveSurvey, saveSurveyProgress } from "../_lib/storage";
import { getNextQuestionIdFromAnswer } from "../_lib/navigation";

const getQuestionById = (survey: ISurvey | null, id: string | null) => {
  if (!survey || !id) return null;
  return survey.questions.find((question) => question.id === id) ?? null;
};

const evaluateSurveyProgress = (
  survey: ISurvey | null,
  answers: Record<string, StoredAnswer>
): SurveyStateSnapshot => {
  if (!survey) {
    return {
      answers: {},
      currentQuestionId: null,
      nextQuestionId: null,
      status: "idle",
    };
  }

  const visited = new Set<string>();
  const prunedAnswers: Record<string, StoredAnswer> = {};
  let pointer: string | null = survey.startQuestionId ?? null;
  let status: SurveyStore["status"] = "idle";
  let currentQuestionId: string | null = pointer;
  let nextQuestionId: string | null = pointer;

  while (pointer) {
    if (visited.has(pointer)) {
      status = "error";
      currentQuestionId = pointer;
      nextQuestionId = pointer;
      break;
    }

    visited.add(pointer);

    const question = getQuestionById(survey, pointer);
    if (!question) {
      status = "error";
      currentQuestionId = null;
      nextQuestionId = null;
      break;
    }

    const answer = answers[pointer];
    if (!answer) {
      status =
        prunedAnswers && Object.keys(prunedAnswers).length > 0
          ? "inProgress"
          : "idle";
      currentQuestionId = pointer;
      nextQuestionId = pointer;
      break;
    }

    prunedAnswers[pointer] = { ...answer };

    const resolvedNext = getNextQuestionIdFromAnswer(question, answer, answers);

    if (!resolvedNext) {
      status = "completed";
      currentQuestionId = null;
      nextQuestionId = null;
      pointer = null;
      break;
    }

    const nextQuestionExists = Boolean(getQuestionById(survey, resolvedNext));
    if (!nextQuestionExists) {
      status = "error";
      currentQuestionId = null;
      nextQuestionId = null;
      break;
    }

    pointer = resolvedNext;
    currentQuestionId = resolvedNext;
    nextQuestionId = resolvedNext;
  }

  if (status === "idle") {
    currentQuestionId = survey.startQuestionId ?? null;
    nextQuestionId = currentQuestionId;
  }

  if (status === "inProgress" && !nextQuestionId) {
    nextQuestionId = survey.startQuestionId ?? null;
    currentQuestionId = nextQuestionId;
  }

  return {
    answers: prunedAnswers,
    currentQuestionId,
    nextQuestionId,
    status,
  };
};

interface UpdateAnswerPayload {
  nextQuestionId: string | null;
  completed: boolean;
  answer?: IUserAnswer;
}

interface SurveyStateSnapshot {
  answers: Record<string, StoredAnswer>;
  currentQuestionId: string | null;
  nextQuestionId: string | null;
  status: SurveyStore["status"];
}

export interface SurveyStore {
  survey: ISurvey | null;
  currentQuestionId: string | null;
  answers: Record<string, StoredAnswer>;
  status: "idle" | "inProgress" | "completed" | "error";
  setSurvey: (data: ISurvey) => void;
  getCurrentQuestion: () => ISurveyQuestion | null;
  updateAnswer: (response: UpdateAnswerPayload) => void;
  setStoredAnswer: (questionId: string, answer: StoredAnswer) => void;
  setStatus: (status: SurveyStore["status"]) => void;
  reset: () => void;
  hydrateProgress: (data: ISaveSurvey) => void;
}

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  survey: null,
  currentQuestionId: null,
  answers: {},
  status: "idle",

  setSurvey: (data) =>
    set((state) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("surveyId", data.id);
      }

      return {
        survey: data,
        currentQuestionId: state.currentQuestionId ?? data.startQuestionId,
        answers: state.answers ?? {},
        status: state.status,
      };
    }),

  getCurrentQuestion: () => {
    const { survey, currentQuestionId } = get();
    return survey?.questions.find((q) => q.id === currentQuestionId) ?? null;
  },

  updateAnswer: (response) =>
    set((state) => {
      const newAnswers = response.answer
        ? { ...state.answers, [response.answer.questionId]: response.answer }
        : state.answers;

      const updated = {
        currentQuestionId: response.nextQuestionId ?? state.currentQuestionId,
        status: response.completed ? "completed" : "inProgress",
        answers: newAnswers,
      };

      saveSurveyProgress({
        nextQuestionId: updated.currentQuestionId,
        status: updated.status,
        answers: updated.answers,
      });

      return updated as Partial<SurveyStore>;
    }),

  setStoredAnswer: (questionId, answer) =>
    set((state) => {
      const updatedAnswers = { ...state.answers };

      if (answer === null) {
        delete updatedAnswers[questionId];
      } else {
        updatedAnswers[questionId] = { ...answer };
      }

      const evaluated = evaluateSurveyProgress(state.survey, updatedAnswers);

      saveSurveyProgress({
        nextQuestionId: evaluated.nextQuestionId,
        status: evaluated.status,
        answers: evaluated.answers,
      });

      return {
        answers: evaluated.answers,
        currentQuestionId: evaluated.currentQuestionId,
        status: evaluated.status,
      };
    }),

  setStatus: (status) => set({ status }),

  reset: () => set({ survey: null, currentQuestionId: null, answers: {} }),

  hydrateProgress: (data) =>
    set((state) => {
      if (!state.survey) return state;

      const nextStatus =
        data.status === "completed" || data.status === "inProgress"
          ? data.status
          : state.status;

      return {
        currentQuestionId:
          data.nextQuestionId ??
          state.survey?.startQuestionId ??
          state.currentQuestionId,
        status: nextStatus,
        answers: data.answers ?? state.answers,
      };
    }),
}));

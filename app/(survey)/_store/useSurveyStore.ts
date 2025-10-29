import { create } from "zustand";
import { ISurvey, ISurveyQuestion } from "../_types/survey";
import { IUserAnswer, StoredAnswer } from "../_types/answer";
import { ISaveSurvey, saveSurveyProgress } from "../_lib/storage";

interface UpdateAnswerPayload {
  nextQuestionId: string | null;
  completed: boolean;
  answer?: IUserAnswer;
}

interface SurveyStore {
  survey: ISurvey | null;
  currentQuestionId: string | null;
  answers: Record<string, StoredAnswer>;
  status: "idle" | "inProgress" | "completed" | "error";
  setSurvey: (data: ISurvey) => void;
  getCurrentQuestion: () => ISurveyQuestion | null;
  updateAnswer: (response: UpdateAnswerPayload) => void;
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
          data.nextQuestionId ?? state.survey?.startQuestionId ?? state.currentQuestionId,
        status: nextStatus,
        answers: data.answers ?? state.answers,
      };
    }),
}));

import { create } from "zustand";
import { ISurvey, ISurveyQuestion } from "../_types/survey";
import { IUserAnswer, StoredAnswer } from "../_types/answer";
import { saveSurveyProgress } from "../_lib/storage";

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
}

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  survey: null,
  currentQuestionId: null,
  answers: {},
  status: "idle",

  setSurvey: (data) =>
    set({
      survey: data,
      currentQuestionId: data.startQuestionId,
      answers: {},
      status: "inProgress",
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
}));

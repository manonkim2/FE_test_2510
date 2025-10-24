import { create } from "zustand";
import { ISurvey, ISurveyQuestion } from "../_types/survey";

type StoredAnswer =
  | { type: "singleChoice"; optionId: string }
  | { type: "multiChoice"; optionIds: string[] }
  | { type: "text"; text: string }
  | null;

interface SurveyStore {
  survey: ISurvey | null;
  currentQuestionId: string | null;
  answers: Record<string, StoredAnswer>;
  status: "idle" | "inProgress" | "completed" | "error";
  setSurvey: (data: ISurvey) => void;
  getCurrentQuestion: () => ISurveyQuestion | null;
  updateAnswer: (response: {
    nextQuestionId: string | null;
    completed: boolean;
  }) => void;
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
    set((state) => ({
      currentQuestionId: response.nextQuestionId ?? state.currentQuestionId,
      status: response.completed ? "completed" : "inProgress",
    })),

  setStatus: (status) => set({ status }),

  reset: () => set({ survey: null, currentQuestionId: null, answers: {} }),
}));

// const buildAnswer = (
//   question: ISurveyQuestion,
//   answer: AnswerValue
// ): StoredAnswer => {
//   if (answer === null || answer === undefined) {
//     return null;
//   }

//   switch (question.type) {
//     case "singleChoice":
//       return {
//         type: "singleChoice",
//         optionId: typeof answer === "string" ? answer : "",
//       };
//     case "multiChoice":
//       return {
//         type: "multiChoice",
//         optionIds: Array.isArray(answer) ? answer : [],
//       };
//     case "text":
//       return {
//         type: "text",
//         text: typeof answer === "string" ? answer : "",
//       };
//     default:
//       return null;
//   }
// };

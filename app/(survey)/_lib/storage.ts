import { StoredAnswer } from "../_types/answer";

export interface ISaveSurvey {
  nextQuestionId: string | null;
  status: string;
  answers: Record<string, StoredAnswer>;
}

export const saveSurveyProgress = (data: ISaveSurvey) => {
  localStorage.setItem("surveyProgress", JSON.stringify(data));
};

import { StoredAnswer } from "../_types/answer";

export const saveSurveyProgress = (data: {
  nextQuestionId: string | null;
  status: string;
  answers: Record<string, StoredAnswer>;
}) => {
  localStorage.setItem("surveyProgress", JSON.stringify(data));
};

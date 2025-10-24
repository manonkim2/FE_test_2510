export interface ISurveyOption {
  id: string;
  label: string;
  nextQuestionId?: string | null;
}

export interface ISurveyQuestion {
  id: string;
  type: "singleChoice" | "multiChoice" | "text";
  text: string;
  required?: boolean;
  options?: ISurveyOption[];
  nextQuestionId?: string | null;
  minSelect?: number;
  maxSelect?: number;
}

export interface ISurvey {
  id: string;
  title: string;
  version: number;
  startQuestionId: string;
  questions: ISurveyQuestion[];
}

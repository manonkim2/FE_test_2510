export interface ISurveyOption {
  id: string;
  label: string;
  nextQuestionId?: string | null;
}

export interface ISurveyConditionalNext {
  go: string | null;
  default?: boolean;
  when?: {
    anySelectedIn?: {
      questionId: string;
      optionIds: string[];
    };
  };
}

export interface ISurveyQuestion {
  id: string;
  type: "singleChoice" | "multiChoice" | "text";
  text: string;
  required?: boolean;
  options?: ISurveyOption[];
  nextQuestionId?: string | null;
  next?: ISurveyConditionalNext[];
  minSelect?: number;
  maxSelect?: number;
  maxLength?: number;
}

export interface ISurvey {
  id: string;
  title: string;
  version: number;
  startQuestionId: string;
  questions: ISurveyQuestion[];
}

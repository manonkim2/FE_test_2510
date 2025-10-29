type SingleChoiceAnswer = { type: "singleChoice"; optionId?: string | null };
type MultiChoiceAnswer = { type: "multiChoice"; optionIds: string[] };
type TextAnswer = { type: "text"; text: string | null };

export type StoredAnswer =
  | SingleChoiceAnswer
  | MultiChoiceAnswer
  | TextAnswer
  | null;

export type IUserAnswer = (SingleChoiceAnswer | MultiChoiceAnswer | TextAnswer) &
  {
    questionId: string;
  };

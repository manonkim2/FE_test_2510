export type StoredAnswer =
  | { type: "singleChoice"; optionId: string }
  | { type: "multiChoice"; optionIds: string[] }
  | { type: "text"; text: string }
  | null;

export type IUserAnswer = Exclude<StoredAnswer, null> & {
  questionId: string;
};

export type SurveyStatus =
  | "idle"
  | "inProgress"
  | "completed"
  | "error";

export const isAdminEditableStatus = (status: SurveyStatus) =>
  status !== "idle";

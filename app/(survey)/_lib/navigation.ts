import { StoredAnswer } from "../_types/answer";
import { ISurvey, ISurveyQuestion } from "../_types/survey";

export const resolveConditionalNext = (
  question: ISurveyQuestion | null,
  answers: Record<string, StoredAnswer>
): string | null | undefined => {
  if (!question?.next?.length) return question?.nextQuestionId ?? undefined;

  let fallback: string | null | undefined =
    question.nextQuestionId ?? null;

  for (const route of question.next) {
    if (route.default) {
      fallback = route.go ?? null;
      continue;
    }

    if (!route.when) continue;

    const { anySelectedIn } = route.when;
    let matched = true;

    if (anySelectedIn) {
      const targetAnswer = answers[anySelectedIn.questionId];
      if (!targetAnswer) {
        matched = false;
      } else if (targetAnswer.type === "singleChoice") {
        matched = Boolean(
          targetAnswer.optionId &&
            anySelectedIn.optionIds.includes(targetAnswer.optionId)
        );
      } else if (targetAnswer.type === "multiChoice") {
        matched = targetAnswer.optionIds.some((optionId) =>
          anySelectedIn.optionIds.includes(optionId)
        );
      } else {
        matched = false;
      }
    }

    if (matched) {
      return route.go ?? null;
    }
  }

  return fallback ?? null;
};

export const getNextQuestionIdFromAnswer = (
  question: ISurveyQuestion | null,
  answer: StoredAnswer | undefined,
  answers: Record<string, StoredAnswer>
): string | null => {
  if (!question) return null;

  if (!answer) {
    const conditionalNext = resolveConditionalNext(question, answers);
    if (conditionalNext !== undefined) return conditionalNext;
    return question.nextQuestionId ?? null;
  }

  if (question.type === "singleChoice") {
    if (answer.type !== "singleChoice" || !answer.optionId) {
      const conditionalNext = resolveConditionalNext(question, answers);
      if (conditionalNext !== undefined) return conditionalNext;
      return question.nextQuestionId ?? null;
    }

    const matchedOption = question.options?.find(
      (option) => option.id === answer.optionId
    );
    if (matchedOption) {
      if (matchedOption.nextQuestionId !== undefined) {
        return (
          matchedOption.nextQuestionId ??
          resolveConditionalNext(question, answers) ??
          null
        );
      }
    }
  }

  if (question.type === "multiChoice" && answer.type === "multiChoice") {
    const matchedOption = question.options?.find((option) =>
      answer.optionIds.includes(option.id)
    );
    if (matchedOption && matchedOption.nextQuestionId !== undefined) {
      return (
        matchedOption.nextQuestionId ??
        resolveConditionalNext(question, answers) ??
        null
      );
    }
  }

  const conditionalNext = resolveConditionalNext(question, answers);
  if (conditionalNext !== undefined) return conditionalNext;

  return question.nextQuestionId ?? null;
};

export const buildQuestionPath = (
  survey: ISurvey,
  answers: Record<string, StoredAnswer>
) => {
  const path: ISurveyQuestion[] = [];
  const visited = new Set<string>();
  let pointer = survey.startQuestionId ?? null;

  while (pointer) {
    if (visited.has(pointer)) break;
    visited.add(pointer);

    const question = survey.questions.find((q) => q.id === pointer);
    if (!question) break;

    path.push(question);

    const answer = answers[pointer];
    if (!answer) break;

    const nextId = getNextQuestionIdFromAnswer(question, answer, answers);
    if (!nextId) break;

    pointer = nextId;
  }

  return path;
};

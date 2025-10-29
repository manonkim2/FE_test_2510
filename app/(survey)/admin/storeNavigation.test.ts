import { beforeEach, describe, expect, it } from "vitest";

import survey from "../../data/survey.json";
import { useSurveyStore } from "../_store/useSurveyStore";
import { ISurvey } from "../_types/survey";

const typedSurvey = survey as ISurvey;

const setAnswersForTechBranch = (options: {
  techStackOptionIds: string[];
  techDepthOptionId: string;
  exampleText: string;
}) => {
  const store = useSurveyStore.getState();

  store.setStoredAnswer("q1", {
    type: "singleChoice",
    optionId: "q1o2",
  });

  store.setStoredAnswer("q2_tech", {
    type: "singleChoice",
    optionId: "q2t_o1",
  });

  store.setStoredAnswer("q3_tech_stack", {
    type: "multiChoice",
    optionIds: options.techStackOptionIds,
  });

  store.setStoredAnswer("q4_tech_depth", {
    type: "singleChoice",
    optionId: options.techDepthOptionId,
  });

  store.setStoredAnswer("q5_example", {
    type: "text",
    text: options.exampleText,
  });
};

describe("useSurveyStore conditional navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    useSurveyStore.setState({
      survey: null,
      answers: {},
      currentQuestionId: null,
      status: "idle",
    });
    const store = useSurveyStore.getState();
    store.setSurvey(typedSurvey);
    store.setStatus("inProgress");
  });

  it("routes to SFU follow-up when WebRTC stack is selected", () => {
    setAnswersForTechBranch({
      techStackOptionIds: ["q3t_o7"],
      techDepthOptionId: "q4t_o3",
      exampleText: "대규모 WebRTC 트래픽 최적화 경험",
    });

    const store = useSurveyStore.getState();

    expect(store.currentQuestionId).toBe("q6_sfu");
    expect(store.status).toBe("inProgress");
  });

  it("falls back to workstyle question when WebRTC stack is not selected", () => {
    setAnswersForTechBranch({
      techStackOptionIds: ["q3t_o1"],
      techDepthOptionId: "q4t_o1",
      exampleText: "트랜잭션 튜닝 사례",
    });

    const store = useSurveyStore.getState();

    expect(store.currentQuestionId).toBe("q6_workstyle");
    expect(store.status).toBe("inProgress");
  });

  it("prunes downstream answers when branch conditions change", () => {
    setAnswersForTechBranch({
      techStackOptionIds: ["q3t_o7"],
      techDepthOptionId: "q4t_o2",
      exampleText: "WebRTC 분산 처리 경험",
    });

    const store = useSurveyStore.getState();

    // 사용자가 SFU 질문까지 응답했다고 가정
    store.setStoredAnswer("q6_sfu", {
      type: "singleChoice",
      optionId: "q6s_o1",
    });

    let updatedStore = useSurveyStore.getState();
    expect(updatedStore.answers["q6_sfu"]).toBeDefined();

    // WebRTC 스택 선택을 해제하여 분기 경로를 변경
    store.setStoredAnswer("q3_tech_stack", {
      type: "multiChoice",
      optionIds: ["q3t_o3"],
    });

    updatedStore = useSurveyStore.getState();

    expect(updatedStore.answers["q6_sfu"]).toBeUndefined();
    expect(updatedStore.currentQuestionId).toBe("q6_workstyle");
  });
});

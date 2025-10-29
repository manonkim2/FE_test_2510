"use client";

import type { SurveyStatus } from "../_utils/utils";

interface AdminStatusPanelProps {
  status: SurveyStatus;
  statusBadgeLabel: string;
  editingPulseActive: boolean;
  visibleQuestionsCount: number;
  answeredCount: number;
  progressPercent: number;
}

const AdminStatusPanel = ({
  status,
  statusBadgeLabel,
  editingPulseActive,
  visibleQuestionsCount,
  answeredCount,
  progressPercent,
}: AdminStatusPanelProps) => {
  return (
    <>
      <div className="px-5 py-1 text-center backdrop-blur-sm">
        <p className="text-lg font-semibold text-gray-700">
          현재 설문 진행 상태
        </p>
        <span className="mt-2 inline-block rounded-full bg-brand/10 px-4 py-1 text-xs font-medium text-brand">
          {statusBadgeLabel}
        </span>
      </div>

      <div className="sticky top-4 z-20 space-y-4">
        {editingPulseActive && visibleQuestionsCount > 0 && (
          <div className="rounded-2xl bg-brand border border-brand/30 px-4 py-3 shadow-sm backdrop-blur-xl animate-pulse [animation-duration:3s]">
            <div className="flex items-center justify-between text-xs font-medium text-white">
              <span>
                응답 완료 {answeredCount}/{visibleQuestionsCount}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/70 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {status === "inProgress" && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-center text-xs text-amber-700">
          선택하신 내용이 바뀌어, 이어지는 질문에 새로 답변이 필요합니다.
          <br />
          아래에서 바로 진행해 주세요.
        </p>
      )}

      {status === "error" && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-center text-xs text-red-600">
          분기 정보에 오류가 감지되었습니다. 문항 응답을 다시 확인하거나 분기
          설정을 검토해 주세요.
        </p>
      )}

      {!visibleQuestionsCount && (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
          아직 저장된 응답이 없습니다.
        </p>
      )}
    </>
  );
};

export default AdminStatusPanel;

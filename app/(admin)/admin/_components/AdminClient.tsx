"use client";

import Spinner from "@/app/components/Spinner";
import type { ISurvey } from "@/app/(survey)/_types/survey";
import AdminStatusPanel from "./AdminStatusPanel";
import AdminQuestionList from "./AdminQuestionList";
import { useAdminSurvey } from "../_hooks/useAdminSurvey";

interface AdminClientProps {
  initialSurvey: ISurvey | null;
  initialError?: string | null;
}

const AdminClient = ({
  initialSurvey,
  initialError = null,
}: AdminClientProps) => {
  const {
    initialized,
    error,
    status,
    surveyLoaded,
    answers,
    canEdit,
    visibleQuestions,
    editingQuestionId,
    editingPulseActive,
    answeredCount,
    progressPercent,
    statusBadgeLabel,
    hasAnswers,
    handleStartEditing,
    handleCloseEditing,
  } = useAdminSurvey(initialSurvey, initialError);

  if (!initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <Spinner label="설문 데이터를 불러오는 중입니다…" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-red-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-red-600">
            설문 데이터를 불러오는 데 실패했습니다.
          </h1>
          <p className="mt-2 text-sm text-red-500">{error}</p>
        </section>
      </main>
    );
  }

  if (!surveyLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-gray-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            설문 데이터를 찾을 수 없습니다.
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            새로고침 후에도 문제가 계속되면 다시 시도해 주세요.
          </p>
        </section>
      </main>
    );
  }

  if (status === "idle" && !hasAnswers) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="rounded-3xl border border-gray-200 bg-surface px-8 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            진행 중인 설문이 없습니다.
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            메인 화면에서 설문을 시작하면 응답을 확인할 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  const containerClass = [
    "relative max-w-2xl w-full rounded-2xl border bg-white/95 p-8 shadow-md transition",
    editingPulseActive
      ? "border-brand/40 shadow-brand/20 ring-2 ring-brand/30"
      : "border-gray-100",
  ].join(" ");

  return (
    <main
      className={`min-h-screen w-full bg-background px-4 py-10 sm:px-6 ${
        editingPulseActive
          ? "bg-linear-to-b from-brand/5 via-transparent to-background"
          : ""
      }`}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className={`${containerClass} space-y-6`}>
          {editingPulseActive && (
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-brand/5 blur-2xl" />
          )}

          <AdminStatusPanel
            status={status}
            statusBadgeLabel={statusBadgeLabel}
            editingPulseActive={editingPulseActive}
            visibleQuestionsCount={visibleQuestions.length}
            answeredCount={answeredCount}
            progressPercent={progressPercent}
          />

          <AdminQuestionList
            questions={visibleQuestions}
            answers={answers}
            canEdit={canEdit}
            editingQuestionId={editingQuestionId}
            onStartEditing={handleStartEditing}
            onCloseEditing={handleCloseEditing}
          />
        </div>
      </div>
    </main>
  );
};

export default AdminClient;

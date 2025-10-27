"use client";

import { useSurveyStore } from "../_store/useSurveyStore";

export default function AdminPage() {
  const { status, answers } = useSurveyStore();

  if (status === "idle") {
    return (
      <main className="p-8 text-center">
        <h1 className="text-xl font-semibold">진행 중인 설문이 없습니다.</h1>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🧩 설문 진행 상황</h1>
      <p className="mb-4">
        <strong>상태:</strong> {status}
      </p>
      <pre className="p-4 rounded-md text-left text-sm">
        {JSON.stringify(answers, null, 2)}
      </pre>
    </main>
  );
}

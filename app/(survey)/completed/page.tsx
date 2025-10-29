"use client";

import Button from "@/app/components/Button";

const CompletedPage = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b  to-gray-50 text-center px-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="text-5xl mb-4">🎉</div>
        <p className="text-3xl font-bold text-black py-2">설문 완료</p>
        <p className="text-gray-600 mb-6">참여해주셔서 진심으로 감사합니다.</p>

        <Button
          text="메인으로 돌아가기"
          onClick={() => {
            window.location.replace("/");
          }}
        />
      </div>
    </main>
  );
};

export default CompletedPage;

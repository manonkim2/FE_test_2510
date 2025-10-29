import Spinner from "@/app/components/Spinner";

const SurveyLoading = () => (
  <main className="flex min-h-screen items-center justify-center bg-background px-6">
    <Spinner label="설문 데이터를 준비하고 있습니다…" />
  </main>
);

export default SurveyLoading;

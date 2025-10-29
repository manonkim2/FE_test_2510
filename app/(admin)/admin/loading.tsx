import Spinner from "@/app/components/Spinner";

const AdminLoading = () => (
  <main className="flex min-h-screen items-center justify-center bg-background px-6">
    <Spinner label="어드민 설문 데이터를 불러오는 중입니다…" />
  </main>
);

export default AdminLoading;

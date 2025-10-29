import type { ISurvey } from "@/app/(survey)/_types/survey";
import AdminClient from "./_components/AdminClient";

const ADMIN_SURVEY_ID = "join-reasons-2025";

const fetchAdminSurvey = async (): Promise<{
  survey: ISurvey | null;
  error: string | null;
}> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  try {
    const response = await fetch(
      `${baseUrl}/api/surveys/${ADMIN_SURVEY_ID}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const message =
        typeof errJson?.message === "string"
          ? errJson.message
          : `설문 로드 실패 (${response.status})`;
      return { survey: null, error: message };
    }

    const survey = (await response.json()) as ISurvey;
    return { survey, error: null };
  } catch (error) {
    return {
      survey: null,
      error:
        error instanceof Error
          ? error.message
          : "어드민 데이터 로드 중 알 수 없는 오류가 발생했습니다.",
    };
  }
};

const AdminPage = async () => {
  const { survey, error } = await fetchAdminSurvey();

  return <AdminClient initialSurvey={survey} initialError={error} />;
};

export default AdminPage;

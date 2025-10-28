import MainClient from "./_components/MainClient";
import { ISurvey } from "@/app/(survey)/_types/survey";

const HomePage = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/surveys/join-reasons-2025`
  );

  const survey: ISurvey = await res.json();

  return (
    <main className="min-h-screen bg-background flex justify-center items-center">
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-gray-500 bg-surface px-8 py-10 shadow-sm flex flex-col items-center justify-center min-h-[500px]">
        <span className="text-xs font-secondary uppercase tracking-[0.3em] text-brand mb-1">
          Unitblack Survey
        </span>
        <h1 className="text-3xl font-semibold leading-tight text-foreground">
          {survey.title}
        </h1>

        <MainClient survey={survey} />
      </section>
    </main>
  );
};

export default HomePage;

import MainClient from "./_components/MainClient";
import { ISurvey } from "@/app/(survey)/_types/survey";

const HomePage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/surveys`);

  const survey: ISurvey = await res.json();

  return (
    <main className="text-center w-screen h-screen flex flex-col justify-center">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>

        <MainClient survey={survey} />
      </div>
    </main>
  );
};

export default HomePage;

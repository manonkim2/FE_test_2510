import StartButton from "@/app/(survey)/_components/StartButton";
import { ISurvey } from "@/app/(survey)/_types/survey";

const HomePage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/surveys`);

  if (!res.ok) {
    return (
      <main className="max-w-lg mx-auto p-8 text-center">
        <h1 className="text-xl font-bold text-red-500">
          설문을 불러올 수 없습니다.
        </h1>
      </main>
    );
  }

  const survey: ISurvey = await res.json();

  return (
    <main className="text-center w-screen h-screen flex flex-col justify-center">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>

        <StartButton survey={survey} />
      </div>
    </main>
  );
};

export default HomePage;

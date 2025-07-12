import BreathingExercises from "../../components/BreathingExercises";
import GoBackButton from "../../components/GoBackButton";
import { ProgressProvider } from "../../components/ProgressContext";

export default function BreathingPage() {
  return (
    <ProgressProvider>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <GoBackButton />
        <div className="w-full max-w-lg mx-auto bg-white/90 p-8 rounded-2xl shadow-lg mt-10">
          <h1 className="text-2xl font-bold text-blue-800 mb-4 rounded-xl text-center">Breathing Exercises</h1>
          <BreathingExercises />
        </div>
      </main>
    </ProgressProvider>
  );
}

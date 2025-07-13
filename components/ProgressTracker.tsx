import { useProgress } from "./ProgressContext";

export default function ProgressTracker() {
  const { 
    breathingStreak, 
    meditationMonkBadge, 
    therapyBadge,
    breathingBadge,
    unlockedLevels
  } = useProgress();

  // Map context values to display data
  const badges = [
    ...(breathingBadge ? ['Breathing Master'] : []),
    ...(meditationMonkBadge ? ['Meditation Monk'] : []),
    ...(therapyBadge ? ['Therapy Pro'] : [])
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
        <div className="flex-1 text-center">
          <div className="text-3xl font-bold text-blue-600">{unlockedLevels.length}</div>
          <div className="text-gray-700 text-sm">Unlocked Levels</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-3xl font-bold text-green-600">{breathingStreak}</div>
          <div className="text-gray-700 text-sm">Breathing Streak</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {meditationMonkBadge ? '✅' : '❌'}
          </div>
          <div className="text-gray-700 text-sm">Meditation Badge</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-3xl font-bold text-yellow-600">{breathingStreak}</div>
          <div className="text-gray-700 text-sm">Current Streak</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {badges.length ? (
          badges.map((b, i) => (
            <span key={i} className="bg-yellow-300 text-yellow-900 font-bold px-3 py-1 rounded-full shadow">{b}</span>
          ))
        ) : (
          <span className="text-xs text-gray-400">No badges yet — keep going!</span>
        )}
      </div>
      <div className="mt-2 text-center text-xs text-gray-500">
        {/* Using breathingStreak for both current and longest streak since you don't have separate values */}
        Longest streak: {breathingStreak} days
      </div>
    </div>
  );
}
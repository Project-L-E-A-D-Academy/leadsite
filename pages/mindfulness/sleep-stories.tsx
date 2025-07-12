import { useState } from "react";
import GoBackButton from "../../components/GoBackButton";
import { useProgress, ProgressProvider } from "../../components/ProgressContext";

const sounds = [
  {
    name: "White Noise",
    emoji: "🎧",
    url: "https://www.youtube.com/embed/nMfPqeZjc2c?rel=0",
    duration: 10 * 60 * 60,
    benefits: ["Blocks distractions", "Helps with sleep and focus", "Calms babies", "Masks tinnitus"]
  },
  {
    name: "Pink Noise",
    emoji: "🌸",
    url: "https://www.youtube.com/embed/HIkAOMw_sjw?rel=0",
    duration: 10 * 60 * 60,
    benefits: ["Improves deep sleep and memory", "Reduces stress", "More soothing than white noise"]
  },
  {
    name: "Brown Noise",
    emoji: "🟤",
    url: "https://www.youtube.com/embed/QH0t_ogClhA?rel=0",
    duration: 4 * 60 * 60,
    benefits: ["Deeply calming", "Aids focus (especially ADHD)", "Helps with anxiety and overstimulation"]
  },
  {
    name: "Blue Noise",
    emoji: "🔵",
    url: "https://www.youtube.com/embed/Z8UWafkbgsc?rel=0",
    duration: 12 * 60 * 60,
    benefits: ["Sharpens high frequencies", "Helps with high-pitched tinnitus", "Used in hearing tests"]
  },
  {
    name: "Violet Noise",
    emoji: "🟣",
    url: "https://www.youtube.com/embed/GYZy5f92FpQ?rel=0",
    duration: 10 * 60 * 60,
    benefits: ["Therapy for severe tinnitus", "High-frequency auditory training"]
  },
  {
    name: "Green Noise (Natural Blend)",
    emoji: "🟢",
    url: "https://www.youtube.com/embed/C3W2v64cKos?rel=0",
    duration: 3 * 60 * 60,
    benefits: ["Mimics nature sounds", "Promotes mindfulness and calm", "Great for meditation and relaxation"]
  },
  {
    name: "Waves + Piano",
    emoji: "🌊🎹",
    url: "https://www.youtube.com/embed/kmhKuif1JCI?rel=0",
    duration: 60 * 60,
    benefits: ["Stress relief", "Meditative sleep"]
  },
  {
    name: "Rain Sound",
    emoji: "🌧️",
    url: "https://www.youtube.com/embed/yIQd2Ya0Ziw?rel=0",
    duration: 8 * 60 * 60,
    benefits: ["Calming the mind", "Deep sleep", "Easing anxiety"]
  },
  {
    name: "Campfire",
    emoji: "🔥",
    url: "https://www.youtube.com/embed/UgHKb_7884o?rel=0",
    duration: 12 * 60 * 60,
    benefits: ["Fall/winter sleep", "Emotional comfort"]
  }
];

function SleepStoriesPage() {
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [completed, setCompleted] = useState(Array(sounds.length).fill(false));
  const [progress, setProgress] = useState(0);
  const [playTimer, setPlayTimer] = useState<NodeJS.Timeout | null>(null);

  const { increment } = useProgress();

  function handlePlay(i: number) {
    setCurrent(i);
    setPlaying(true);
    setRepeat(false);
    setProgress(0);
    if (playTimer) clearInterval(playTimer);

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      setProgress(elapsed / sounds[i].duration);
      if (elapsed >= sounds[i].duration) {
        clearInterval(interval);
        handleComplete(i);
      }
    }, 1000);
    setPlayTimer(interval);
  }

  function handleClose() {
    setCurrent(null);
    setPlaying(false);
    setRepeat(false);
    setProgress(0);
    if (playTimer) clearInterval(playTimer);
  }

  function handleComplete(idx: number) {
    setCompleted((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    increment("sleep");
    setPlaying(false);
    setProgress(1);
    if (playTimer) clearInterval(playTimer);
  }

  function handleRepeat() {
    if (current === null) return;
    handlePlay(current);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <GoBackButton />
      <div className="w-full max-w-2xl mx-auto bg-white/90 p-8 rounded-2xl shadow-lg mt-10">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 rounded-xl text-center">
          Sleep Stories & Sounds
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sounds.map((sound, i) => (
            <div key={i} className="rounded-xl shadow-md p-5 bg-blue-50">
              <div className="flex items-center mb-2">
                <span className="text-2xl">{sound.emoji}</span>
                <span className="font-bold text-lg ml-2">{sound.name}</span>
                {completed[i] && (
                  <span className="ml-2 text-green-600 font-bold">✓</span>
                )}
              </div>
              <ul className="mb-2 text-xs text-gray-700">
                {sound.benefits.map((b, idx) => (
                  <li key={idx}>✅ {b}</li>
                ))}
              </ul>
              <button
                className="w-full bg-blue-600 text-white rounded-lg py-1 mt-1 hover:bg-blue-700 transition"
                onClick={() => handlePlay(i)}
                disabled={playing && current === i}
              >
                {playing && current === i ? "Playing..." : "Play"}
              </button>
            </div>
          ))}
        </div>

        {current !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[95vw] max-w-2xl relative">
              <h2 className="text-xl font-bold mb-2 text-center">
                {sounds[current].emoji} {sounds[current].name}
              </h2>
              <iframe
                width="100%"
                height="180"
                src={`${sounds[current].url}&autoplay=1${repeat ? "&loop=1" : ""}&playlist=${sounds[current].url.split('/embed/')[1].split("?")[0]}`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="rounded-xl mx-auto mb-3"
                style={{ display: "block" }}
                title={sounds[current].name}
              />
              <div className="w-full bg-gray-200 rounded-xl overflow-hidden h-3 mb-2">
                <div
                  className="bg-blue-400 h-3 rounded-xl transition-all"
                  style={{ width: `${Math.min(progress, 1) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>
                  {Math.floor(progress * sounds[current].duration / 60)} min
                </span>
                <span>
                  {Math.floor(sounds[current].duration / 60)} min
                </span>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <button
                  onClick={handleRepeat}
                  className={`px-4 py-1 rounded-lg shadow ${repeat ? "bg-blue-700 text-white" : "bg-gray-200 text-blue-700"}`}
                >
                  {repeat ? "Repeating" : "Repeat"}
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-1 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 shadow"
                >
                  Close
                </button>
              </div>
              {progress >= 1 && (
                <div className="mt-4 bg-green-100 rounded-xl p-2 text-center text-green-700 font-bold">
                  🎉 Congrats, you finished this sound!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ✅ Wrap with ProgressProvider
export default function SleepStoriesPageWrapper() {
  return (
    <ProgressProvider>
      <SleepStoriesPage />
    </ProgressProvider>
  );
}

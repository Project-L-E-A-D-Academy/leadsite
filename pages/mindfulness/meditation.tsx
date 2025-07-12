// pages/mindfulness/meditation.tsx
import { useState } from "react";
import { useProgress, ProgressProvider } from "../../components/ProgressContext";

const MEDITATION_VIDEOS = [
  {
    id: "video-1",
    title: "Mindful Breathing (5 min)",
    url: "https://www.youtube.com/embed/SEfs5TJZ6Nk"
  },
  {
    id: "video-2",
    title: "Body Scan Meditation (7 min)",
    url: "https://www.youtube.com/embed/wGFog-o1x8I"
  },
  {
    id: "video-3",
    title: "Loving Kindness (10 min)",
    url: "https://www.youtube.com/embed/sTANio_2E0Q"
  },
];

function MeditationPageContent() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const { meditationVideos, meditationMonkBadge, increment } = useProgress();

  function handlePlay(id: string) {
    setPlaying(id);
    setVideoEnded(false);
  }

  function handleEnded(id: string) {
    setVideoEnded(true);
    if (!meditationVideos.includes(id)) {
      increment("meditation", { videoId: id });
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center py-8">
      <div className="max-w-lg w-full bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-purple-800">Guided Meditation</h1>
        <div className="w-full grid grid-cols-1 gap-4">
          {MEDITATION_VIDEOS.map(video => (
            <div key={video.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center mb-2">
              <div className="font-bold text-lg mb-1">{video.title}</div>
              <button
                onClick={() => handlePlay(video.id)}
                className="mb-2 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                disabled={playing === video.id}
              >
                {meditationVideos.includes(video.id) ? "Watched" : (playing === video.id ? "Playing..." : "Watch")}
              </button>
              {playing === video.id && (
                <div className="w-full flex flex-col items-center">
                  <iframe
                    width="100%"
                    height="220"
                    src={video.url + "?autoplay=1"}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={video.title}
                    onLoad={() => setTimeout(() => setVideoEnded(true), 1000 * 60)}
                  />
                  <button
                    className="mt-2 px-4 py-1 rounded bg-green-600 text-white"
                    onClick={() => handleEnded(video.id)}
                    disabled={videoEnded}
                  >
                    Mark as Finished
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-blue-900 font-bold">
          Videos completed: {meditationVideos.length} / {MEDITATION_VIDEOS.length}
        </div>
        {meditationMonkBadge && (
          <div className="mt-2 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-xl inline-block font-bold">
            🧘 Monk Badge unlocked!
          </div>
        )}
      </div>
    </main>
  );
}

export default function MeditationPage() {
  return (
    <ProgressProvider>
      <MeditationPageContent />
    </ProgressProvider>
  );
}

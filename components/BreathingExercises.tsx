import { useState, useEffect, useRef } from "react";
import AnimatedCircle from "./AnimatedCircle";
import ProgressBar from "./ProgressBar";
import Badge from "./Badge";
import { useProgress } from "./ProgressContext";

const LEVELS = [
  { label: "Level 1", inhale: 4, hold: 4, exhale: 4, cycles: 3 },
  { label: "Level 2", inhale: 5, hold: 5, exhale: 5, cycles: 4 },
  { label: "Level 3", inhale: 6, hold: 6, exhale: 6, cycles: 5 },
  { label: "Level 4", inhale: 7, hold: 7, exhale: 7, cycles: 6 },
  { label: "Level 5", inhale: 8, hold: 8, exhale: 8, cycles: 7 },
];

const PHASES = ["inhale", "hold", "exhale"] as const;
type Phase = typeof PHASES[number];

function getPhaseColor(phase: Phase) {
  if (phase === "inhale") return "bg-blue-400";
  if (phase === "hold") return "bg-yellow-400";
  return "bg-green-400";
}
function getPhaseLabel(phase: Phase) {
  if (phase === "inhale") return "Inhale";
  if (phase === "hold") return "Hold";
  return "Exhale";
}

export default function BreathingExercises() {
  const [level, setLevel] = useState(0);
  const [custom, setCustom] = useState(false);
  const [customVals, setCustomVals] = useState({ inhale: 4, hold: 4, exhale: 4, cycles: 3 });

  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [phaseCount, setPhaseCount] = useState(LEVELS[0].inhale);
  const [cycle, setCycle] = useState(1);
  const [progress, setProgress] = useState(0);
  const [congrats, setCongrats] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { increment, unlockedLevels, breathingBadge } = useProgress();
  const allowCustom = unlockedLevels.includes(4);

  useEffect(() => {
    if (!started) return;
    setCongrats(false);
    setPhase("inhale");
    setPhaseCount(getVals().inhale);
    setCycle(1);
    setProgress(0);
  }, [level, started, custom]);

  useEffect(() => {
    if (!started) return;
    let duration = getVals()[phase];
    setPhaseCount(duration);
    setProgress(0);
    let t0 = Date.now();
    let progressInterval: NodeJS.Timeout | null = null;

    if (duration > 0) {
      progressInterval = setInterval(() => {
        setProgress(Math.min(1, (Date.now() - t0) / (duration * 1000)));
      }, 50);
    }

    timerRef.current = setTimeout(async () => {
      if (phase === "inhale") setPhase("hold");
      else if (phase === "hold") setPhase("exhale");
      else if (phase === "exhale") {
        if (cycle < getVals().cycles) {
          setCycle(cycle + 1);
          setPhase("inhale");
        } else {
          setStarted(false);
          setCongrats(true);
          setShowNote(true);

          try {
            await increment("breathing", {
              level: custom ? 0 : level + 1,
              custom: custom ? customVals : null,
              note,
            });
          } catch (err) {
            console.error("🔥 Error calling increment:", err);
          }
        }
      }
      setProgress(0);
    }, duration * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [started, phase, cycle, level, custom]);

  function getVals() {
    return custom ? customVals : LEVELS[level];
  }

  function start() {
    setStarted(true);
    setCongrats(false);
    setPhase("inhale");
    setCycle(1);
    setShowNote(false);
  }
  function stop() {
    setStarted(false);
    setCongrats(false);
    setPhase("inhale");
    setProgress(0);
    setShowNote(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md flex flex-col items-center relative">
      <h2 className="text-xl font-bold mb-2 text-blue-700">Breathing Exercise</h2>

      <div className="mb-4 w-full flex flex-col items-center">
        <label className="font-semibold">Select Level:</label>
        <select
          value={level}
          onChange={e => setLevel(Number(e.target.value))}
          disabled={started}
          className="border rounded-xl px-2 py-1 mt-2"
        >
          {LEVELS.map((lv, i) => (
            <option key={i} value={i} disabled={!unlockedLevels.includes(i)}>
              {lv.label} {unlockedLevels.includes(i) ? "" : "🔒"}
            </option>
          ))}
        </select>

        {allowCustom && (
          <div className="mt-2">
            <label>
              <input
                type="checkbox"
                checked={custom}
                onChange={e => setCustom(e.target.checked)}
                disabled={started}
              /> Custom Timing
            </label>
            {custom && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['inhale', 'hold', 'exhale', 'cycles'].map((k) => (
                  <input
                    key={k}
                    type="number"
                    value={(customVals as any)[k]}
                    onChange={e => setCustomVals(v => ({ ...v, [k]: Number(e.target.value) }))}
                    className="border rounded w-16 px-2"
                    placeholder={k}
                    min={1}
                    disabled={started}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        <button
          className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 shadow"
          onClick={start}
          disabled={started}
        >Start</button>
        <button
          className="px-4 py-2 rounded-xl bg-gray-400 text-white hover:bg-gray-500 shadow"
          onClick={stop}
          disabled={!started}
        >Stop</button>
      </div>

      <div className="w-full mb-4">
        <ProgressBar progress={cycle / getVals().cycles} color="bg-blue-600" />
        <div className="text-xs text-gray-500 text-center mb-2">Cycle {cycle} / {getVals().cycles}</div>
      </div>

      {started && (
        <div className="w-full flex flex-col items-center">
          <AnimatedCircle phase={phase} progress={progress} />
          <span className={`text-lg font-semibold mb-1 ${getPhaseColor(phase)} px-4 py-1 rounded-xl text-white transition`}>
            {getPhaseLabel(phase)}
          </span>
          <ProgressBar progress={progress} color={getPhaseColor(phase)} />
          <div className="text-3xl font-bold text-gray-700 mb-2">{phaseCount}s</div>
        </div>
      )}

      {!started && congrats && (
        <div className="bg-green-100 rounded-xl px-4 py-3 mt-4 text-center font-semibold text-green-700 shadow">
          🎉 Congratulations! You finished all breathing cycles.
        </div>
      )}

      {showNote && (
        <div className="w-full mt-4">
          <textarea
            placeholder="How do you feel after this session? (optional)"
            className="w-full border rounded-xl p-2"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
          />
        </div>
      )}

      {breathingBadge && (
        <Badge text="🏅 Level 5 Badge Unlocked!" />
      )}
    </div>
  );
}

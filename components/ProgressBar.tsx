export default function ProgressBar({ progress, color = "bg-blue-500" }: { progress: number, color?: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-xl h-5 mb-2 overflow-hidden">
      <div
        className={`${color} h-5 rounded-xl transition-all`}
        style={{ width: `${progress * 100}%`, transition: 'width 0.2s' }}
      />
    </div>
  );
}
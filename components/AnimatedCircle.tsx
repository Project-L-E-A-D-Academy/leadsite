import { motion } from "framer-motion";

export default function AnimatedCircle({ phase, progress }: { phase: string, progress: number }) {
  let color = "bg-blue-300";
  if (phase === "hold") color = "bg-yellow-300";
  if (phase === "exhale") color = "bg-green-300";
  let size = 120 + progress * 120;
  return (
    <div className="flex justify-center items-center mb-4">
      <motion.div
        className={`rounded-full shadow-lg ${color}`}
        style={{
          width: size,
          height: size,
        }}
        animate={{ scale: 1 + 0.08 * progress }}
        transition={{ type: "spring", stiffness: 60 }}
      />
    </div>
  );
}
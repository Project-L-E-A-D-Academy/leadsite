// components/LoadingScreen.tsx
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[url('/paper-texture.png')] bg-cover bg-center">
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-5xl md:text-6xl font-extrabold text-red-600 drop-shadow-lg tracking-wider mb-4"
      >
        LEAD
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-xl text-gray-800 font-medium text-center px-4"
      >
        Learn. Empower. Achieve. Dream.
      </motion.p>

      <div className="mt-10 flex gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0s]" />
        <span className="w-3 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.1s]" />
        <span className="w-3 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
      </div>
    </div>
  )
}

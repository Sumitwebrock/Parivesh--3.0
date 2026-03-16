import { motion } from "motion/react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-20 h-20 bg-[#1A5C1A] rounded-full mx-auto mb-6 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 64 64" className="w-12 h-12">
            <circle cx="32" cy="32" r="28" fill="#281174" />
            <path
              d="M32 12 L38 24 L32 28 L26 24 Z M24 30 L30 42 L24 46 L18 42 Z M40 30 L46 42 L40 46 L34 42 Z"
              fill="#2736b9"
            />
            <circle cx="32" cy="32" r="6" fill="#C5E1A5" />
          </svg>
        </motion.div>
        <motion.h2
          className="text-2xl font-bold text-[#1A5C1A] mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          PARIVESH 3.0
        </motion.h2>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

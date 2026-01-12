import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

interface Achievement {
  name: string;
  description: string;
  points: number;
  icon: string;
}

interface Props {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClose }: Props) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-gradient-to-br from-champion-500 to-rival-500 rounded-3xl p-1 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gray-900 rounded-3xl p-8 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h3 className="text-3xl font-black text-white mb-2">
              Achievement Unlocked!
            </h3>
            <p className="text-xl font-bold text-champion-400 mb-2">
              {achievement.name}
            </p>
            <p className="text-gray-300 mb-4">
              {achievement.description}
            </p>
            <div className="inline-block px-6 py-2 bg-champion-500/20 border-2 border-champion-500 rounded-full">
              <span className="text-champion-400 font-black text-lg">
                +{achievement.points} Points
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
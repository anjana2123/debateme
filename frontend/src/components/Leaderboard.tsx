import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { gamificationAPI, type LeaderboardEntry } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ isOpen, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await gamificationAPI.getLeaderboard(10);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
      case 2:
        return 'from-gray-400/20 to-gray-500/10 border-gray-400/50';
      case 3:
        return 'from-orange-500/20 to-orange-600/10 border-orange-500/50';
      default:
        return 'from-gray-800/50 to-gray-900/50 border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-900 rounded-3xl border-2 border-champion-500/30 max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-champion-600 to-rival-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-3xl font-black text-white">Leaderboard</h2>
                <p className="text-champion-100 text-sm">Top Debaters</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-champion-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading rankings...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No rankings yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-gradient-to-r ${getRankColor(entry.rank)} rounded-xl border-2 p-4 hover:scale-[1.02] transition`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg">
                        {entry.username}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Level {entry.level}</span>
                        <span>•</span>
                        <span>{entry.debates_won} wins</span>
                        <span>•</span>
                        <span>{entry.achievements_count} achievements</span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="text-2xl font-black text-champion-400">
                        {entry.total_points.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
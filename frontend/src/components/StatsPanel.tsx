import { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Star, Award, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
}

interface UserStats {
  total_debates: number;
  debates_won: number;
  debates_lost: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  achievements: Achievement[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsPanel({ isOpen, onClose }: Props) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('user_id') || 'default_user';
      
      fetch(`https://debateme-production-c0b0.up.railway.app/api/v1/stats/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load stats');
          return res.json();
        })
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Stats error:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unlockedAchievements = stats?.achievements.filter(a => a.unlocked) || [];
  const winRate = stats && stats.total_debates > 0 
    ? Math.round((stats.debates_won / stats.total_debates) * 100) 
    : 0;

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
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-gray-900 rounded-3xl border-2 border-champion-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-champion-500 border-t-transparent"></div>
              <p className="text-white mt-4">Loading your stats...</p>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button 
                onClick={onClose} 
                className="px-6 py-2 bg-champion-500 text-white rounded-lg hover:bg-champion-600 transition"
              >
                Close
              </button>
            </div>
          ) : stats ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-champion-600 to-rival-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-1">Your Profile</h2>
                    <p className="text-champion-100">Level {stats.level} • {stats.total_points} Points</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Level Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white mb-2">
                    <span>Level {stats.level}</span>
                    <span>Level {stats.level + 1}</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                      style={{ width: `${(stats.total_points % 500) / 5}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 py-4 font-bold transition ${
                    activeTab === 'stats'
                      ? 'text-white bg-gray-800/50 border-b-2 border-champion-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Statistics
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex-1 py-4 font-bold transition ${
                    activeTab === 'achievements'
                      ? 'text-white bg-gray-800/50 border-b-2 border-champion-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Achievements ({unlockedAchievements.length}/{stats.achievements.length})
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {activeTab === 'stats' ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <StatCard
                      icon={<Trophy className="w-8 h-8" />}
                      label="Win Rate"
                      value={`${winRate}%`}
                      color="text-yellow-500"
                    />
                    <StatCard
                      icon={<Target className="w-8 h-8" />}
                      label="Total Debates"
                      value={stats.total_debates}
                      color="text-blue-500"
                    />
                    <StatCard
                      icon={<Flame className="w-8 h-8" />}
                      label="Current Streak"
                      value={stats.current_streak}
                      color="text-orange-500"
                    />
                    <StatCard
                      icon={<Star className="w-8 h-8" />}
                      label="Debates Won"
                      value={stats.debates_won}
                      color="text-green-500"
                    />
                    <StatCard
                      icon={<TrendingUp className="w-8 h-8" />}
                      label="Longest Streak"
                      value={stats.longest_streak}
                      color="text-purple-500"
                    />
                    <StatCard
                      icon={<Award className="w-8 h-8" />}
                      label="Total Points"
                      value={stats.total_points}
                      color="text-champion-500"
                    />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {stats.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-xl border-2 transition ${
                          achievement.unlocked
                            ? 'bg-champion-500/10 border-champion-500/50'
                            : 'bg-gray-800/50 border-gray-700 opacity-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                              : 'bg-gray-700'
                          }`}>
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">{achievement.name}</h4>
                            <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                            <span className={`text-xs font-bold ${
                              achievement.unlocked ? 'text-champion-400' : 'text-gray-500'
                            }`}>
                              {achievement.points} points
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// StatCard component
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
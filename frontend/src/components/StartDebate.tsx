import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { debateAPI } from '../api/client';
import { motion } from 'framer-motion';
import { Sparkles, Swords } from 'lucide-react';

interface Props {
  onDebateStart: (debateId: string, data: any) => void;
}

export default function StartDebate({ onDebateStart }: Props) {
  const [topic, setTopic] = useState('');
  const [stance, setStance] = useState('');
  const [mode, setMode] = useState<'normal' | 'roast'>('normal');
  const [maxRounds, setMaxRounds] = useState(10);

  const startMutation = useMutation({
    mutationFn: () => debateAPI.startDebate({ topic, user_stance: stance, mode, max_rounds: maxRounds }),
    onSuccess: (data) => {
      onDebateStart(data.debate_id, data);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && stance.trim()) {
      startMutation.mutate();
    }
  };

  const suggestions = [
    "Remote work increases productivity",
    "AI creates more jobs than it destroys",
    "Social media harms society",
    "Universal basic income is essential",
    "Space > Ocean exploration"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <motion.div 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center mb-16 relative"
>
  <div className="absolute inset-0 bg-champion-500/10 blur-3xl"></div>
  <div className="relative">
    <motion.div
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="inline-block mb-6"
    >
      <Swords className="w-20 h-20 text-champion-400" strokeWidth={2} />
    </motion.div>
    <h2 className="text-6xl font-black mb-4 text-black drop-shadow-2xl">
      Enter the Arena
    </h2>
    <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
      Choose your position. Face an AI opponent armed with evidence and logic.
      <br />
      <span className="text-champion-400 font-bold">May the best argument win.</span>
    </p>
  </div>
</motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-champion-500/50 to-rival-500/50 rounded-3xl blur-xl opacity-30"></div>
        
        <div className="relative backdrop-blur-2xl bg-black/40 rounded-3xl border border-white/10 p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Topic Input */}
            <div>
                
              <label className="block text-sm font-black text-white mb-3 tracking-wide uppercase">
               Battle Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What shall we debate?"
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-champion-500/50 focus:ring-2 focus:ring-champion-500/20 outline-none transition text-white placeholder-gray-500 backdrop-blur-sm"
                maxLength={500}
              />
              
              {/* Quick Topics */}
              <div className="mt-4">
                <p className="text-xs text-white mb-3 uppercase tracking-wider">Quick picks:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTopic(s)}
                      className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition border border-white/5 hover:border-champion-500/30 backdrop-blur-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stance */}
            <div>
              <label className="block text-sm font-black text-white mb-3 tracking-wide uppercase">
               Your Opening Strike
              </label>
              <textarea
                value={stance}
                onChange={(e) => setStance(e.target.value)}
                placeholder="Present your case with evidence and reasoning..."
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-champion-500/50 focus:ring-2 focus:ring-champion-500/20 outline-none transition h-40 resize-none text-white placeholder-gray-500 backdrop-blur-sm"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-white">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Strong cases cite specific examples
                </p>
                <p className="text-xs text-gray-500 font-mono">{stance.length}/1000</p>
              </div>
            </div>

            {/* Config Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mode */}
              <div>
                <label className="block text-sm font-black text-white mb-4 tracking-wide uppercase">
                 Combat Style
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setMode('normal')}
                    className={`w-full p-5 rounded-xl border-2 transition text-left group ${
                      mode === 'normal'
                        ? 'border-champion-500 bg-champion-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="font-bold text-white mb-1 flex items-center gap-2">
                      <span className="text-lg">⚖️</span>
                      Professional
                    </p>
                    <p className="text-xs text-gray-200">
                      Evidence-based, respectful discourse
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('roast')}
                    className={`w-full p-5 rounded-xl border-2 transition text-left group ${
                      mode === 'roast'
                        ? 'border-rival-500 bg-rival-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="font-bold text-white mb-1 flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      Spirited
                    </p>
                    <p className="text-xs text-gray-200">
                      Witty, sharp counter-arguments (Roast Mode)
                    </p>
                  </button>
                </div>
              </div>

              {/* Rounds */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-4 tracking-wide uppercase">
                  Battle Length
                </label>
                <div className="bg-white/5 border-2 border-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-5xl font-black text-white">{maxRounds}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-wider">Rounds</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-champion-500"
                    style={{
                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((maxRounds - 3) / 12) * 100}%, rgba(255,255,255,0.1) ${((maxRounds - 3) / 12) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-3 uppercase tracking-wider">
                    <span>Quick</span>
                    <span>Deep</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!topic.trim() || !stance.trim() || startMutation.isPending}
              className="relative w-full py-5 bg-gradient-to-r from-champion-600 via-champion-500 to-rival-600 text-white font-black text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition overflow-hidden group shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rival-600 via-champion-500 to-champion-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-3">
                {startMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entering Arena...
                  </>
                ) : (
                  <>
                    <Swords className="w-6 h-6" />
                    BEGIN BATTLE
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {startMutation.isError && (
            <div className="mt-6 p-4 bg-rival-500/10 border border-rival-500/30 rounded-xl text-rival-400 text-sm backdrop-blur-sm">
              <strong>Connection Failed:</strong> Backend server offline.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { debateAPI } from '../api/client';
import { Send, ExternalLink, AlertTriangle, Shield, Sword, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type DebateResponse, type Evidence, type Fallacy } from '../api/client';

interface Message {
  type: 'user' | 'ai';
  content: string;
  round: number;
  evidence?: Evidence[];
  fallacies?: Fallacy[];
}

interface Props {
  debateId: string;
  initialData: DebateResponse;
  onNewDebate: () => void;
}


export default function DebateArena({ debateId, initialData, onNewDebate }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [debateEnded, setDebateEnded] = useState(false);
  const [scores, setScores] = useState({ user: 0, ai: 0 });
  const [maxRounds] = useState(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      type: 'ai',
      content: initialData.ai_counter_argument,
      round: 1,
      evidence: initialData.evidence,
      fallacies: []
    }]);
    setScores({ user: initialData.user_score, ai: initialData.ai_score });
  }, [initialData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const continueMutation = useMutation({
    mutationFn: (argument: string) => debateAPI.continueDebate({ 
  debate_id: debateId, 
  user_argument: argument 
}),
    onSuccess: (data: DebateResponse) => {
      setMessages(prev => [...prev, {
        type: 'user',
        content: input,
        round: data.round_number,
        fallacies: data.fallacies_detected
      }]);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: data.ai_counter_argument,
        round: data.round_number,
        evidence: data.evidence
      }]);
      setScores({ user: data.user_score, ai: data.ai_score });
      setDebateEnded(data.is_debate_ended);
      setInput('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !debateEnded && !continueMutation.isPending) {
      continueMutation.mutate(input);
    }
  };

  return (
    <div className="space-y-6">
      {/* Floating Score Orbs */}
      <div className="flex items-center justify-center gap-12">
        {/* Your Score */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-champion-500/30 rounded-full blur-2xl"></div>
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-champion-500 to-champion-600 flex flex-col items-center justify-center shadow-champion border-4 border-champion-400/30">
            <Shield className="w-8 h-8 text-white mb-1" />
            <div className="text-4xl font-black text-white">{scores.user}</div>
            <div className="text-xs text-champion-100 font-bold uppercase tracking-wider">You</div>
          </div>
        </motion.div>

        {/* VS Badge */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-4 border-white/10 shadow-xl">
            <span className="text-3xl font-black text-white">VS</span>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-300 font-mono whitespace-nowrap">
            Round {Math.ceil(messages.length / 2)}/{maxRounds}
          </div>
        </div>

        {/* AI Score */}
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-rival-500/30 rounded-full blur-2xl"></div>
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-rival-500 to-rival-600 flex flex-col items-center justify-center shadow-rival border-4 border-rival-400/30">
            <Sword className="w-8 h-8 text-white mb-1" />
            <div className="text-4xl font-black text-white">{scores.ai}</div>
            <div className="text-xs text-rival-100 font-bold uppercase tracking-wider">AI</div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(Math.ceil(messages.length / 2) / maxRounds) * 100}%` }}
            className="h-full bg-gradient-to-r from-champion-500 to-rival-500"
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Battle View */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-champion-500/20 to-rival-500/20 rounded-3xl blur-xl"></div>
        
        <div className="relative backdrop-blur-2xl bg-black/40 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Messages */}
          <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 custom-scrollbar">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === 'user' ? -50 : 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] ${msg.type === 'user' ? 'mr-auto' : 'ml-auto'}`}>
                    {/* Argument Card */}
                    <div className={`relative group ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-champion-500/20 to-champion-600/10 border-champion-500/30'
                        : 'bg-gradient-to-br from-rival-500/20 to-rival-600/10 border-rival-500/30'
                    } rounded-2xl border-2 p-6 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all`}>
                      {/* Glow on Hover */}
                      <div className={`absolute -inset-1 ${
                        msg.type === 'user' ? 'bg-champion-500/20' : 'bg-rival-500/20'
                      } rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition -z-10`}></div>

                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-br from-champion-500 to-champion-600'
                            : 'bg-gradient-to-br from-rival-500 to-rival-600'
                        } flex items-center justify-center shadow-lg`}>
                          {msg.type === 'user' ? (
                            <Shield className="w-5 h-5 text-white" />
                          ) : (
                            <Sword className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {msg.type === 'user' ? 'You' : 'AI Opponent'}
                          </p>
                          <p className="text-xs text-gray-400">Round {msg.round}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-gray-100 leading-relaxed whitespace-pre-wrap mb-4">
                        {msg.content}
                      </p>

                      {/* Evidence */}
                      {msg.evidence && msg.evidence.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {msg.evidence.length} Evidence Source{msg.evidence.length > 1 ? 's' : ''}
                          </p>
                          <div className="space-y-2">
                            {msg.evidence.map((ev, evIdx) => (
                              <a
                                key={evIdx}
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 bg-black/30 border border-white/10 rounded-lg hover:border-evidence-500/50 transition group/evidence backdrop-blur-sm"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                                      {ev.source}
                                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover/evidence:text-evidence-500" />
                                    </p>
                                    <p className="text-xs text-gray-300 line-clamp-2">{ev.snippet}</p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-white mb-1">
                                      {Math.round(ev.credibility_score * 100)}%
                                    </span>
                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          ev.credibility_score >= 0.8 ? 'bg-evidence-500' :
                                          ev.credibility_score >= 0.6 ? 'bg-yellow-500' :
                                          'bg-warning-500'
                                        }`}
                                        style={{ width: `${ev.credibility_score * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallacies */}
                      {msg.fallacies && msg.fallacies.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-warning-500/30 bg-warning-500/10 -m-6 mt-6 p-6 rounded-b-2xl">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-warning-500" />
                            <p className="text-sm font-bold text-warning-500">
                              Logical Flaw Detected
                            </p>
                          </div>
                          <div className="space-y-2">
                            {msg.fallacies.map((fallacy, fIdx) => (
                              <div key={fIdx} className="p-3 bg-black/40 border border-warning-500/30 rounded-lg backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-sm font-bold text-white">
                                    {fallacy.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                    fallacy.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    fallacy.severity === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  }`}>
                                    {fallacy.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  {fallacy.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {!debateEnded ? (
            <div className="p-6 bg-black/70 border-t border-white/10 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Strike back with your argument..."
                  className="flex-1 px-5 py-4 bg-gray-900/70 border-2 border-gray-700 rounded-xl focus:border-evidence-500/50 focus:ring-2 focus:ring-evidence-500/20 outline-none transition text-white placeholder-gray-400 backdrop-blur-sm"
                  maxLength={1000}
                  disabled={continueMutation.isPending}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || continueMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-champion-600 to-champion-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-champion"
                >
                  {continueMutation.isPending ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      STRIKE
                    </>
                  )}
                </motion.button>
              </form>
              <p className="text-sm text-gray-300 mt-3 text-center">
                {input.length}/1000 • Type "I agree" to concede with honor
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 bg-gradient-to-br from-champion-500/20 via-black/60 to-rival-500/20 text-center backdrop-blur-xl border-t border-white/10"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
              </motion.div>
              <h3 className="text-4xl font-black text-white mb-3">
                Battle Complete
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                {scores.user > scores.ai
                  ? "🏆 VICTORY - Your logic prevailed!"
                  : scores.ai > scores.user
                  ? "⚔️ DEFEAT - The opponent was stronger."
                  : "🤝 STALEMATE - Evenly matched!"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewDebate}
                className="px-10 py-4 bg-gradient-to-r from-champion-600 via-champion-500 to-rival-600 text-white font-black text-lg rounded-xl shadow-2xl"
              >
                NEW BATTLE
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
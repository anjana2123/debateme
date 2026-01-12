import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, TrendingUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export default function AuthModal({ isOpen, onClose, onContinueAsGuest }: Props) {
  const [mode, setMode] = useState<'welcome' | 'signup' | 'login'>('welcome');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div className="min-h-screen w-full flex items-center justify-center py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full"
          >
            {/* Gradient border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-champion-500 to-rival-500 rounded-3xl blur-lg opacity-75"></div>
            
            {/* Main card */}
            <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {mode === 'welcome' && (
                <div className="p-8">
                  {/* Header with gradient */}
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-br from-champion-500/20 to-rival-500/20 rounded-2xl mb-4">
                      <Trophy className="w-12 h-12 text-champion-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">
                      Welcome to DebateMe
                    </h2>
                    <p className="text-gray-400">
                      Sharpen your arguments. Climb the ranks.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-champion-500/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-champion-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Save Your Progress</p>
                        <p className="text-xs text-gray-400">Track stats and unlock achievements</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-rival-500/20 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-rival-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Compete on Leaderboard</p>
                        <p className="text-xs text-gray-400">See how you rank globally</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-evidence-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-evidence-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Level Up Your Skills</p>
                        <p className="text-xs text-gray-400">Gain XP and unlock new features</p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setMode('signup')}
                      className="w-full py-4 bg-gradient-to-r from-champion-600 to-champion-500 text-white font-bold rounded-xl hover:scale-105 transition shadow-champion"
                    >
                      Sign Up Free
                    </button>

                    <button
                      onClick={() => setMode('login')}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition border border-white/20"
                    >
                      Login
                    </button>

                    <button
                      onClick={onContinueAsGuest}
                      className="w-full py-3 text-gray-400 hover:text-white font-medium transition text-sm"
                    >
                      Continue as Guest →
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Guest mode: Stats saved locally only
                  </p>
                </div>
              )}

              {mode === 'signup' && (
                <SignupForm onBack={() => setMode('welcome')} onSuccess={onClose} />
              )}

              {mode === 'login' && (
                <LoginForm onBack={() => setMode('welcome')} onSuccess={onClose} />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Signup Form
function SignupForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://debateme-production-c0b0.up.railway.app/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Signup failed');
      }

      const data = await response.json();
      // Store auth token
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userMode', 'authenticated');
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <button 
        onClick={onBack} 
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition"
      >
        ← Back
      </button>

      <h3 className="text-3xl font-black text-white mb-2">Create Account</h3>
      <p className="text-gray-400 text-sm mb-6">Join the arena and compete!</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-champion-500 focus:ring-2 focus:ring-champion-500/20 outline-none transition text-white placeholder-gray-500"
            placeholder="your@email.com"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-champion-500 focus:ring-2 focus:ring-champion-500/20 outline-none transition text-white placeholder-gray-500"
            placeholder="DebateMaster"
          />
          <p className="text-xs text-gray-500 mt-1">3-20 characters</p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-champion-500 focus:ring-2 focus:ring-champion-500/20 outline-none transition text-white placeholder-gray-500"
            placeholder="••••••••"
          />
          <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-champion-600 to-champion-500 text-white font-bold rounded-xl hover:scale-105 transition shadow-champion disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}

// Login Form
function LoginForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://debateme-production-c0b0.up.railway.app/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Login failed');
      }

      const data = await response.json();
      // Store auth token
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userMode', 'authenticated');
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <button 
        onClick={onBack} 
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition"
      >
        ← Back
      </button>

      <h3 className="text-3xl font-black text-white mb-2">Welcome Back</h3>
      <p className="text-gray-400 text-sm mb-6">Login to continue your journey</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-champion-500 focus:ring-2 focus:ring-champion-500/20 outline-none transition text-white placeholder-gray-500"
            placeholder="your@email.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-champion-500 focus:ring-2 focus:ring-champion-500/20 outline-none transition text-white placeholder-gray-500"
            placeholder="••••••••"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-champion-600 to-champion-500 text-white font-bold rounded-xl hover:scale-105 transition shadow-champion disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
}
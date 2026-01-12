import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Trophy, Award } from 'lucide-react';
import DebateArena from './components/DebateArena';
import StartDebate from './components/StartDebate';
import StatsPanel from './components/StatsPanel';
import Leaderboard from './components/Leaderboard';
import AuthModal from './components/AuthModal';

const queryClient = new QueryClient();

function App() {
  const [debateId, setDebateId] = useState<string | null>(null);
  const [debateData, setDebateData] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setShowAuthModal(false);
    localStorage.setItem('userMode', 'guest');
  };

  const handleDebateStart = (id: string, data: any) => {
    setDebateId(id);
    setDebateData(data);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-champion-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rival-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Grain Texture Overlay */}
        <div className="fixed inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiAvPjwvc3ZnPg==')] pointer-events-none"></div>

        {/* Header */}
        <header className="backdrop-blur-xl bg-gray-900/95 shadow-2xl border-b border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-champion-500 to-rival-500 rounded-xl blur-md opacity-60"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-champion-500 to-rival-500 rounded-xl flex items-center justify-center shadow-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">DebateMe</h1>
                  <p className="text-xs text-gray-300 tracking-wide font-medium">The Intellectual Colosseum</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-semibold rounded-lg transition border border-yellow-500/30 backdrop-blur-sm flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Rankings
                </button>
                
                <button
                  onClick={() => setShowStats(true)}
                  className="px-4 py-2 bg-champion-500/10 hover:bg-champion-500/20 text-champion-400 font-semibold rounded-lg transition border border-champion-500/30 backdrop-blur-sm flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Profile
                </button>

                {debateId && (
                  <button
                    onClick={() => {
                      setDebateId(null);
                      setDebateData(null);
                    }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition border border-white/20 backdrop-blur-sm"
                  >
                    ← New Battle
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 py-12">
          {!debateId ? (
            <StartDebate onDebateStart={handleDebateStart} />
          ) : (
            <DebateArena 
              debateId={debateId}
              initialData={debateData}
              onNewDebate={() => {
                setDebateId(null);
                setDebateData(null);
              }} 
            />
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-gray-700/50 backdrop-blur-xl bg-gray-900/80">
          <p className="text-sm text-gray-100 font-medium">
            Crafted by <span className="font-black text-white">Anjana Ramachandran</span>
          </p>
        </footer>
      </div>

      {/* ALL MODALS HERE - ONLY ONCE! */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onContinueAsGuest={handleContinueAsGuest}
      />
      <StatsPanel isOpen={showStats} onClose={() => setShowStats(false)} />
      <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </QueryClientProvider>
  );
}

export default App;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { LandingPage } from './LandingPage';
import { EntryScreen } from './EntryScreen';
import { ChatInterface } from './ChatInterface';
import { AdminPanel } from './AdminPanel';
import { Gender } from './types';
import { Shield } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<'landing' | 'entry' | 'chat'>('landing');
  const [user, setUser] = useState<{ id: string; nickname: string; gender?: Gender; interests: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === '/admin');

  useEffect(() => {
    if (isAdmin) return;
    socket.connect();

    socket.on('error', (msg) => {
      setError(msg);
    });

    socket.on('registration:success' as any, ({ userId }: { userId: string }) => {
      setStep('chat');
    });

    return () => {
      socket.disconnect();
      socket.off('error');
      socket.off('registration:success' as any);
    };
  }, [isAdmin]);

  const handleJoin = (nickname: string, gender: Gender, interests: string[]) => {
    setError(null);
    socket.emit('register' as any, { nickname, gender, interests });
    setUser({ id: 'pending', nickname, gender, interests });
  };

  const handleExit = () => {
    socket.disconnect();
    socket.connect(); // Reconnect to be ready for next session
    setUser(null);
    setStep('landing');
  };

  if (isAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden relative">
      {step === 'chat' && user ? (
        <ChatInterface user={user} onExit={handleExit} />
      ) : (
        <>
          <LandingPage onStart={() => setStep('entry')} />
          {step === 'entry' && (
            <EntryScreen onJoin={handleJoin} onClose={() => setStep('landing')} />
          )}
        </>
      )}

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-red-600 text-white rounded-[1.25rem] font-bold shadow-[0_10px_40px_rgba(220,38,38,0.3)] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5">
           <Shield size={20} />
           <div className="flex flex-col">
              <span className="text-xs uppercase font-black opacity-50 tracking-widest">System Error</span>
              <span className="text-sm">{error}</span>
           </div>
           <button onClick={() => setError(null)} className="ml-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg">×</button>
        </div>
      )}
    </div>
  );
}



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
import { GlobalAds, AdUnit } from './components/AdUnit';

export default function App() {
  const [step, setStep] = useState<'landing' | 'entry' | 'chat'>('landing');
  const stepRef = React.useRef(step);
  stepRef.current = step;
  const [user, setUser] = useState<{ id: string; nickname: string; gender?: Gender; interests: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === '/admin');

  useEffect(() => {
    if (isAdmin) return;
    socket.connect();

    socket.on('error', (msg) => {
      setError(msg);
      // If session expired, force logout regardless of current step
      if (msg.toLowerCase().includes('session expired')) {
        handleExit();
      } else if (stepRef.current !== 'chat') {
        setUser(null);
      }
    });

    socket.on('registration:success' as any, ({ userId }: { userId: string }) => {
      setUser(prev => prev ? { ...prev, id: userId } : null);
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
    <div className="min-h-screen bg-bg overflow-x-hidden relative flex flex-col">
      <GlobalAds />
      
      {/* GLOBAL TOP AD SLOT */}
      <div className="w-full flex justify-center py-1 bg-surface/50 border-b border-border z-50 shrink-0 min-h-[50px] md:min-h-[92px]">
        <div className="hidden md:block">
          <AdUnit id="e09cae3901da8691e785bc3a6fb53b5f" format="728x90" />
        </div>
        <div className="md:hidden">
          <AdUnit id="b4f39cdd8d2c49287bc15b998684cb7e" format="320x50" />
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden h-full">
        {/* GLOBAL LEFT SKYSCRAPER */}
        <aside className="hidden lg:flex w-[165px] shrink-0 items-start justify-center py-2 border-r border-border bg-surface/5">
          <AdUnit id="1792c7f73f1077081cad03590a1a650d" format="160x600" className="sticky top-2" />
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 relative overflow-hidden flex flex-col h-full">
          {step === 'chat' && user ? (
            <div className="flex-1 h-full">
              <ChatInterface user={user} onExit={handleExit} error={error} setError={setError} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto h-full">
              <LandingPage onStart={() => setStep('entry')} />
              {step === 'entry' && (
                <EntryScreen onJoin={handleJoin} onClose={() => setStep('landing')} error={error} />
              )}
            </div>
          )}
        </main>

        {/* GLOBAL RIGHT SKYSCRAPER */}
        <aside className="hidden lg:flex w-[165px] shrink-0 items-start justify-center py-2 border-l border-border bg-surface/5">
          <AdUnit id="1792c7f73f1077081cad03590a1a650d" format="160x600" className="sticky top-2" />
        </aside>
      </div>

    </div>
  );
}



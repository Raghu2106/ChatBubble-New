/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { LandingPage } from './LandingPage';
import { EntryScreen } from './EntryScreen';
import { ChatInterface } from './ChatInterface';
import { Gender } from './types';
import { Shield } from 'lucide-react';
import { AdUnit, GlobalAds } from './components/AdUnit';
import { SessionTimeoutModal } from './components/SessionTimeoutModal';
import { useDummyUsers } from './hooks/useDummyUsers';

const AdminPanel = React.lazy(() => import('./AdminPanel').then(m => ({ default: m.AdminPanel })));

const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60 minutes
const WARNING_DURATION = 60; // 60 seconds

export default function App() {
  const dummyUsers = useDummyUsers();
  const [step, setStep] = useState<'landing' | 'entry' | 'chat'>('landing');
  const stepRef = React.useRef(step);
  stepRef.current = step;
  const [user, setUser] = useState<{ id: string; nickname: string; gender?: Gender; interests: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === '/admin');
  const lastResetRef = React.useRef(Date.now());
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);

  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = React.useCallback((force = false) => {
    // Only block if modal is showing and we aren't forcing a reset (like when clicking 'Stay')
    if (stepRef.current !== 'chat' || (showTimeoutModal && !force)) return;
    
    // Throttle the reset to every 2 seconds to avoid overhead, unless forced
    const now = Date.now();
    if (!force && now - lastResetRef.current < 2000) return;
    lastResetRef.current = now;
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(() => {
      setShowTimeoutModal(true);
    }, INACTIVITY_LIMIT);
  }, [showTimeoutModal]);

  useEffect(() => {
    if (step === 'chat') {
      resetInactivityTimer(true);
      // Track all common UI interactions
      const events = ['mousemove', 'pointermove', 'keydown', 'click', 'scroll', 'touchstart', 'mousedown', 'wheel'];
      const handler = () => resetInactivityTimer();
      events.forEach(event => window.addEventListener(event, handler, { passive: true }));
      return () => {
        events.forEach(event => window.removeEventListener(event, handler));
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      };
    }
  }, [step, resetInactivityTimer]);

  useEffect(() => {
    if (isAdmin) return;
    socket.connect();

    socket.on('connect', () => {
      // If we already have a user and we are in the chat step, re-register automatically on reconnect
      if (stepRef.current === 'chat' && user) {
        socket.emit('register' as any, { 
          nickname: user.nickname, 
          gender: user.gender, 
          interests: user.interests 
        });
      }
    });

    socket.on('error', (msg) => {
      setError(msg);
      // If session expired, force logout regardless of current step
      if (msg.toLowerCase().includes('session expired')) {
        handleExit();
      } else if (stepRef.current !== 'chat') {
        setUser(null);
        setStep('entry');
      }
    });

    socket.on('registration:success' as any, ({ userId }: { userId: string }) => {
      setUser(prev => prev ? { ...prev, id: userId } : null);
      setStep('chat');
    });

    socket.on('ban', (duration) => {
      handleExit();
      setDisconnectReason(`You have been reported by 5 users. According to the website policy, you will be restricted to use this site for the next 30 minutes.`);
    });

    return () => {
      socket.disconnect();
      socket.off('error');
      socket.off('registration:success' as any);
      socket.off('ban');
    };
  }, [isAdmin]);

  const handleJoin = (nickname: string, gender: Gender, interests: string[]) => {
    setError(null);
    setDisconnectReason(null);
    
    if (!socket.connected) {
      setError('Connection to server lost. Reconnecting...');
      socket.connect();
      return;
    }

    socket.emit('register' as any, { nickname, gender, interests });
    setUser({ id: 'pending', nickname, gender, interests });

    // Add a safety timeout to prevent getting stuck in "pending" state
    setTimeout(() => {
      setUser(prev => {
        if (prev?.id === 'pending') {
          setError('Registration timed out. Please try again or refresh the page.');
          return null;
        }
        return prev;
      });
    }, 15000); // Increased to 15s to be safer
  };

  const handleExit = () => {
    socket.disconnect();
    socket.connect(); // Reconnect to be ready for next session
    setUser(null);
    setStep('landing');
    setShowTimeoutModal(false);
  };

  const handleStay = () => {
    setShowTimeoutModal(false);
    resetInactivityTimer(true);
  };

  const handleTimeoutExit = () => {
    handleExit();
    setDisconnectReason('You were disconnected due to inactivity');
  };

  if (isAdmin) {
    return (
      <React.Suspense fallback={<div className="h-screen bg-bg flex items-center justify-center font-black text-brand animate-pulse">LOADING ADMIN...</div>}>
        <AdminPanel />
      </React.Suspense>
    );
  }

  return (
    <div className="h-dvh bg-bg overflow-hidden relative flex flex-col p-safe">
      <GlobalAds />

      {showTimeoutModal && (
        <SessionTimeoutModal 
          onStay={handleStay} 
          onSignOut={handleTimeoutExit} 
          countdownSeconds={WARNING_DURATION} 
        />
      )}

      <div className="flex flex-1 relative overflow-hidden">
        {/* GLOBAL LEFT SKYSCRAPER */}
        <aside className="hidden lg:flex w-[165px] shrink-0 items-start justify-center py-2 border-r border-border bg-surface/5">
          <AdUnit id="1792c7f73f1077081cad03590a1a650d" format="160x600" className="sticky top-2" />
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {step === 'chat' && user ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* GLOBAL TOP AD SLOT - Inside Chat (Fixed/Sticky behavior handled by ChatInterface or stayed outside) */}
              {/* For chat, we might want it fixed or part of the header. Let's keep it here for now but check ChatInterface */}
              <div className="w-full flex justify-center py-1 bg-surface/50 border-b border-border z-50 shrink-0 min-h-[50px] md:min-h-[60px]">
                <div className="hidden md:block">
                  <AdUnit id="e09cae3901da8691e785bc3a6fb53b5f" format="728x90" />
                </div>
                <div className="md:hidden">
                  <AdUnit id="b4f39cdd8d2c49287bc15b998684cb7e" format="320x50" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatInterface user={user} onExit={handleExit} error={error} setError={setError} dummyUsers={dummyUsers} />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 h-full">
              {/* GLOBAL TOP AD SLOT - SCROLLABLE with Landing Page */}
              <div className="w-full flex justify-center py-1 bg-surface/50 border-b border-border z-50 shrink-0 min-h-[50px] md:min-h-[92px]">
                <div className="hidden md:block">
                  <AdUnit id="e09cae3901da8691e785bc3a6fb53b5f" format="728x90" />
                </div>
                <div className="md:hidden">
                  <AdUnit id="b4f39cdd8d2c49287bc15b998684cb7e" format="320x50" />
                </div>
              </div>

              {disconnectReason && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-xl">
                    <Shield size={20} />
                    <span className="font-bold text-sm uppercase tracking-wider">{disconnectReason}</span>
                  </div>
                </div>
              )}
              <LandingPage onStart={() => setStep('entry')} />
              {step === 'entry' && (
                <EntryScreen 
                  onJoin={handleJoin} 
                  onClose={() => setStep('landing')} 
                  error={error} 
                  loading={user?.id === 'pending'}
                />
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



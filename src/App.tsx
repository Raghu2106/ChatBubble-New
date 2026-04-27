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
    <div className="min-h-screen bg-bg overflow-x-hidden relative">
      {step === 'chat' && user ? (
        <ChatInterface user={user} onExit={handleExit} error={error} setError={setError} />
      ) : (
        <>
          <LandingPage onStart={() => setStep('entry')} />
          {step === 'entry' && (
            <EntryScreen onJoin={handleJoin} onClose={() => setStep('landing')} error={error} />
          )}
        </>
      )}

    </div>
  );
}



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
  const [user, setUser] = useState<{ id: string; nickname: string; gender?: Gender; interests: string[] } | null>(() => {
    const saved = localStorage.getItem('chatbubble_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { return null; }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === '/admin');

  useEffect(() => {
    if (isAdmin) return;
    socket.connect();

    // If we have a stored user on mount, try to resume
    if (user && user.id !== 'pending') {
      socket.emit('resume:session' as any, { userId: user.id });
      setStep('chat');
    }

    socket.on('error', (msg) => {
      setError(msg);
      if (stepRef.current !== 'chat') {
        setUser(null);
        localStorage.removeItem('chatbubble_session');
      }
    });

    socket.on('registration:success' as any, ({ userId }: { userId: string }) => {
      setUser(prev => {
        const updated = prev ? { ...prev, id: userId } : null;
        if (updated) localStorage.setItem('chatbubble_session', JSON.stringify(updated));
        return updated;
      });
      setStep('chat');
    });

    socket.on('connect', () => {
      // Re-resume on reconnect if we were already in chat
      const saved = localStorage.getItem('chatbubble_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.id !== 'pending') {
          socket.emit('resume:session' as any, { userId: parsed.id });
        }
      }
    });

    return () => {
      socket.disconnect();
      socket.off('error');
      socket.off('registration:success' as any);
      socket.off('connect');
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
    localStorage.removeItem('chatbubble_session');
    localStorage.removeItem('chatbubble_threads');
    localStorage.removeItem('chatbubble_current_room');
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



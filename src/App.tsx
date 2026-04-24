/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { EntryScreen } from './EntryScreen';
import { ChatInterface } from './ChatInterface';
import { AdminPanel } from './AdminPanel';
import { Gender } from './types';

export default function App() {
  const [user, setUser] = useState<{ id: string; nickname: string; gender?: Gender } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === '/admin');

  useEffect(() => {
    if (isAdmin) return;
    socket.connect();

    socket.on('error', (msg) => {
      setError(msg);
      // If banned, user might need to see the message clearly
    });

    return () => {
      socket.disconnect();
      socket.off('error');
    };
  }, []);

  const handleJoin = (nickname: string, gender: Gender) => {
    // Register on socket
    socket.emit('register' as any, { nickname, gender });
    
    // We update local state. The server will assign ID, but for the UI flow we can 
    // immediately show the interface. The socket connection is the source of truth for communication.
    // In a real app, you'd wait for a 'registered' acknowledgement with the assigned ID.
    setUser({ id: socket.id || 'me', nickname, gender });
  };

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-black text-red-500 uppercase tracking-tighter">Connection Error</h1>
          <p className="text-text-muted">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-brand text-white font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {!user ? (
        <EntryScreen onJoin={handleJoin} />
      ) : (
        <ChatInterface user={user} />
      )}
    </div>
  );
}



import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Gender, ResponseProfile } from '../types';

interface DummyUser {
  id: string;
  nickname: string;
  gender: Gender;
  isDummy: boolean;
  currentRoom: string;
  responseProfile: ResponseProfile;
}

export const useDummyUsers = () => {
  const [activeDummies, setActiveDummies] = useState<DummyUser[]>([]);

  useEffect(() => {
    // Listen for server-side dummy updates
    const handleUpdate = (dummies: DummyUser[]) => {
      setActiveDummies(dummies);
    };

    socket.on('dummies:update' as any, handleUpdate);
    
    // The server emits 'dummies:update' on connection, 
    // but the socket might already be connected.
    // If we wanted to request it explicitly we could, but server방송 handles it.
    
    return () => {
      socket.off('dummies:update' as any, handleUpdate);
    };
  }, []);

  return activeDummies;
};

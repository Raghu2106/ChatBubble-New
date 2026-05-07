import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { Gender, ResponseProfile, DummyUser } from '../types';

export const useDummyUsers = () => {
  const [activeDummies, setActiveDummies] = useState<DummyUser[]>([]);

  useEffect(() => {
    // Listen for server-side dummy updates
    const handleUpdate = (dummies: DummyUser[]) => {
      setActiveDummies(dummies);
    };

    socket.on('dummies:update' as any, handleUpdate);
    
    // Request initial list immediately in case we missed the connection event
    socket.emit('dummies:get' as any);
    
    return () => {
      socket.off('dummies:update' as any, handleUpdate);
    };
  }, []);

  return activeDummies;
};

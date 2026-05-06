import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageSquare, Globe, User, MoreVertical, 
  Send, ShieldAlert, DoorOpen, Bell, BellOff, RefreshCw,
  Lock, Search, Plus, ChevronDown, Music, Code, Zap,
  Moon, Hash, Shield, ChevronRight, Mars, Venus, X,
  Smile
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Logo } from './components/Logo';
import { socket } from './socket';
import { ChatMessage, Room, Gender, ResponseProfile } from './types';
import { AdUnit } from './components/AdUnit';
import { useDummyUsers } from './hooks/useDummyUsers';
import { generateDummyResponse, generateLobbyChatter } from './services/geminiService';

// Helper to sanitize message content and strip clickable links/HTML
const formatChatMessage = (content: string) => {
  return content.replace(/<[^>]*>/g, '');
};

interface ChatInterfaceProps {
  user: { nickname: string; id: string; gender?: Gender; interests: string[] };
  onExit: () => void;
  error?: string | null;
  setError: (err: string | null) => void;
}

type Tab = 'Rooms' | 'Messages' | 'People';
type SortOption = 'alphabet' | 'gender';
type SortOrder = 'asc' | 'desc';

const CATEGORIES = [
  { id: 'local', name: 'Connect Locally', icon: Globe },
  { id: 'global', name: 'Connect Globally', icon: Globe },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onExit, error, setError }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Rooms');
  const dummyUsers = useDummyUsers();
  const [currentRoom, setCurrentRoom] = useState<string>('lobby');
  const [roomMessages, setRoomMessages] = useState<Record<string, ChatMessage[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; nickname: string; gender?: Gender; isDND?: boolean; currentRoom?: string }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [peopleSortBy, setPeopleSortBy] = useState<SortOption>('alphabet');
  const [peopleSortOrder, setPeopleSortOrder] = useState<SortOrder>('asc');
  const [inputText, setInputText] = useState('');
  const [isDND, setIsDND] = useState(false);
  const [showDNDToast, setShowDNDToast] = useState(false);
  const [reportNotification, setReportNotification] = useState<{ visible: boolean; message: string; type: 'info' | 'warning' | 'success' } | null>(null);
  const [activePrivateChat, setActivePrivateChat] = useState<string | null>(null);
  const [privateThreads, setPrivateThreads] = useState<Record<string, ChatMessage[]>>({});
  const [unreadThreads, setUnreadThreads] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [dummyReplyCounts, setDummyReplyCounts] = useState<Record<string, number>>({});
  const dummyReplyCountsRef = useRef(dummyReplyCounts);

  useEffect(() => {
    dummyReplyCountsRef.current = dummyReplyCounts;
  }, [dummyReplyCounts]);

  // Helper to get response delay based on profile
  const getResponseDelay = (profile: ResponseProfile) => {
    switch (profile) {
      case 'Quick': return Math.random() * 3000 + 5000; // 5-8s as requested
      case 'Moderate': return Math.random() * 30000 + 20000; // 20-50s
      case 'Sluggish': return Math.random() * 120000 + 60000; // 60-180s (1-3 mins)
      default: return null;
    }
  };

  const roomMessagesRef = useRef(roomMessages);
  const privateThreadsRef = useRef(privateThreads);

  useEffect(() => {
    roomMessagesRef.current = roomMessages;
  }, [roomMessages]);

  useEffect(() => {
    privateThreadsRef.current = privateThreads;
  }, [privateThreads]);

  // Lobby Chatter Logic
  useEffect(() => {
    const chatInterval = setInterval(async () => {
      // 25% chance to post a message in lobby every 20 seconds.
      // This ensures that on average messages are spaced out well beyond 5 seconds.
      if (Math.random() > 0.25) return;

      const lobbyDummies = dummyUsers.filter(u => u.currentRoom === 'lobby' && u.responseProfile !== 'Lurker');
      if (lobbyDummies.length === 0) return;

      // Get recent lobby messages for context from Ref
      const recentMessages = (roomMessagesRef.current['lobby'] || []).slice(-10).map(m => ({
        senderName: m.senderName,
        content: m.content
      }));

      const chatter = await generateLobbyChatter(
        lobbyDummies.map(u => ({ nickname: u.nickname, gender: u.gender as string })),
        recentMessages
      );
      
      const newMessage: ChatMessage = {
        id: `dummy-lobby-${Date.now()}`,
        senderId: lobbyDummies.find(u => u.nickname === chatter.senderName)?.id || 'unknown',
        senderName: chatter.senderName,
        content: chatter.content,
        timestamp: Date.now(),
        roomId: 'lobby',
        type: 'public'
      };

      setRoomMessages(prev => ({
        ...prev,
        'lobby': [...(prev['lobby'] || []), newMessage].slice(-100)
      }));
    }, 20000); 

    return () => clearInterval(chatInterval);
  }, [dummyUsers]); 

  // Dummy Private Response Logic
  useEffect(() => {
    const handleDummyResponse = async (otherId: string, profile: ResponseProfile) => {
      if (profile === 'Lurker') return;

      const delay = getResponseDelay(profile);
      if (!delay) return;

      const dummyUser = dummyUsers.find(u => u.id === otherId);
      if (!dummyUser) return;

      // Response delay logic
      setTimeout(async () => {
        // Double check count at execution time
        if ((dummyReplyCountsRef.current[otherId] || 0) >= 2) return;

        const thread = privateThreadsRef.current[otherId] || [];
        if (thread.length === 0 || thread[thread.length - 1].senderId !== user.id) {
          return;
        }

        // Predefined responses for dummy users in private messaging
        const responsePools = [
          ['hi', 'hii', 'hey', 'hello'],
          ['asl', 'asl?', 'ur asl'],
          ['from', 'from?', 'frm', 'from?'],
          ['age', 'age?', 'ur age']
        ];

        // Pick a random category and then a random phrase from it
        const getRandomResponse = () => {
          const pool = responsePools[Math.floor(Math.random() * responsePools.length)];
          return pool[Math.floor(Math.random() * pool.length)];
        };

        const responseText = getRandomResponse();

        // Multiple response logic (up to 2 messages)
        const sendSequence = async (count: number, max: number) => {
          if (count >= max) {
            return;
          }

          const text = count === 0 ? responseText : getRandomResponse();
          
          const msg: ChatMessage = {
            id: `dummy-reply-${Date.now()}-${count}`,
            senderId: otherId,
            senderName: dummyUser.nickname,
            senderGender: dummyUser.gender,
            content: text,
            timestamp: Date.now(),
            recipientId: user.id,
            type: 'private'
          };

          setPrivateThreads(prev => ({
            ...prev,
            [otherId]: [...(prev[otherId] || []), msg]
          }));

          setDummyReplyCounts(prev => ({
            ...prev,
            [otherId]: (prev[otherId] || 0) + 1
          }));

          // Decide if we send another one
          const shouldFollowUp = Math.random() < 0.2 && count < max - 1;
          if (shouldFollowUp) {
            setTimeout(() => sendSequence(count + 1, max), Math.random() * 4000 + 2000);
          }
        };

        const currentCount = dummyReplyCountsRef.current[otherId] || 0;
        const remaining = 2 - currentCount;
        if (remaining <= 0) return;

        const totalToSendMessage = Math.min(remaining, profile === 'Quick' 
          ? (Math.random() < 0.3 ? 2 : 1) 
          : 1);
        
        await sendSequence(0, totalToSendMessage);

        if (activePrivateChatRef.current !== otherId) {
          setUnreadThreads(prev => {
            const next = new Set(prev);
            next.add(otherId);
            return next;
          });
        }
      }, delay);
    };

    // Check for recent messages from user to dummies
    Object.keys(privateThreads).forEach(otherId => {
      if (otherId.startsWith('dummy-')) {
        const thread = privateThreads[otherId];
        const lastMsg = thread[thread.length - 1];
        if (lastMsg && lastMsg.senderId === user.id) {
          const dummyUser = dummyUsers.find(u => u.id === otherId);
          // Only allow up to 2 replies from each dummy
          const replyCount = dummyReplyCountsRef.current[otherId] || 0;
          if (dummyUser && replyCount < 2) {
            const timeSinceLastMsg = Date.now() - lastMsg.timestamp;
            // Only trigger if message was sent in last 2 seconds
            if (timeSinceLastMsg < 2000) { 
              handleDummyResponse(otherId, dummyUser.responseProfile);
            }
          }
        }
      }
    });
  }, [privateThreads, dummyUsers, user.id]);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputText(prev => prev + emojiData.emoji);
  };
  
  // Clear all history on mount to be absolutely safe
  useEffect(() => {
    setRoomMessages({});
    setPrivateThreads({});
    setUnreadThreads(new Set());
  }, []);
  
  const activePrivateChatRef = useRef(activePrivateChat);
  const currentRoomRef = useRef(currentRoom);
  
  useEffect(() => {
    activePrivateChatRef.current = activePrivateChat;
  }, [activePrivateChat]);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [whoBlockedMe, setWhoBlockedMe] = useState<Set<string>>(new Set());
  const [globalStatuses, setGlobalStatuses] = useState<Record<string, { isDND?: boolean }>>({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    socket.on('room:message', (msg) => {
      setRoomMessages(prev => ({
        ...prev,
        [msg.roomId]: [...(prev[msg.roomId] || []), msg].slice(-100)
      }));
    });

    socket.on('private:message', (msg) => {
      const otherId = msg.senderId === user.id ? msg.recipientId! : msg.senderId;
      setPrivateThreads(prev => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), msg]
      }));
      
      if (activePrivateChatRef.current !== otherId && msg.senderId !== user.id) {
        setUnreadThreads(prev => {
          const next = new Set(prev);
          next.add(otherId);
          return next;
        });
      }
    });

    socket.on('users:list', (list: any[]) => {
      setOnlineUsers(list);
      setGlobalStatuses(prev => {
        const next = { ...prev };
        list.forEach(u => {
          next[u.id] = { ...next[u.id], isDND: u.isDND };
        });
        return next;
      });
    });
    socket.on('user:joined', (u: any) => {
      setOnlineUsers(prev => {
        if (prev.some(existing => existing.id === u.id)) return prev;
        return [...prev, u];
      });
      setGlobalStatuses(prev => ({
        ...prev,
        [u.id]: { ...prev[u.id], isDND: u.isDND }
      }));
    });
    socket.on('user:left', (uid) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== uid));
    });
    socket.on('rooms:updated' as any, (updatedRooms: Room[]) => setRooms(updatedRooms));
    socket.on('status:update', ({ userId, isDND }) => {
      setOnlineUsers(prev => prev.map(u => u.id === userId ? { ...u, isDND } : u));
      setGlobalStatuses(prev => ({
        ...prev,
        [userId]: { ...prev[userId], isDND }
      }));
    });

    socket.on('restriction:update' as any, ({ byUserId, status }: { byUserId: string, status: 'restricted' | 'unrestricted' }) => {
      setWhoBlockedMe(prev => {
        const next = new Set(prev);
        if (status === 'restricted') next.add(byUserId);
        else next.delete(byUserId);
        return next;
      });
    });

    socket.on('user:reported' as any, ({ totalReports }: { totalReports: number }) => {
      if (totalReports >= 5) {
        setReportNotification({ 
          visible: true, 
          message: `You have been reported by 5 users. According to the website policy, you will be restricted to use this site for the next 30 minutes`,
          type: 'warning'
        });
      } else {
        setReportNotification({ 
          visible: true, 
          message: `You have been reported by a user for violating site policies.`,
          type: 'info'
        });
        setTimeout(() => setReportNotification(null), 5000);
      }
    });

    // Request initial list/counts explicitly if we are already "registered" (have a real ID)
    if (user.id !== 'pending') {
      socket.emit('join:room', currentRoom);
    }

    return () => {
      socket.off('room:message');
      socket.off('private:message');
      socket.off('users:list');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('rooms:updated' as any);
      socket.off('status:update');
      socket.off('restriction:update' as any);
      socket.off('user:reported' as any);
    };
  }, [currentRoom, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [roomMessages, activePrivateChat, privateThreads, currentRoom]);

  useEffect(() => {
    if (activePrivateChat) {
      setError(null);
      setUnreadThreads(prev => {
        if (!prev.has(activePrivateChat)) return prev;
        const next = new Set(prev);
        next.delete(activePrivateChat);
        return next;
      });
    }
  }, [activePrivateChat, setError]);

  useEffect(() => {
    if (activePrivateChat?.startsWith('dummy-') && error?.toLowerCase().includes('online')) {
      setError(null);
    }
  }, [activePrivateChat, error, setError]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setError(null);
    if (activePrivateChat) {
      if (activePrivateChat.startsWith('dummy-')) {
        // Handle dummy user message locally
        const dummyUser = dummyUsers.find(u => u.id === activePrivateChat);
        const newMessage = {
          id: `local-${Date.now()}`,
          senderId: user.id,
          senderName: user.nickname,
          senderGender: user.gender,
          content: inputText,
          timestamp: Date.now(),
          recipientId: activePrivateChat,
          type: 'private' as const
        };
        setPrivateThreads(prev => ({
          ...prev,
          [activePrivateChat]: [...(prev[activePrivateChat] || []), newMessage]
        }));
      } else {
        socket.emit('send:private', { recipientId: activePrivateChat, content: inputText });
      }
    } else {
      socket.emit('send:message', { roomId: currentRoom, content: inputText });
    }
    setInputText('');
  };

  const switchRoom = (roomId: string) => {
    if (activePrivateChat === null && roomId === currentRoom) {
      setMobileSidebarOpen(false);
      return;
    }
    setCurrentRoom(roomId);
    setActivePrivateChat(null);
    // Don't clear messages anymore, we use roomMessages dictionary
    socket.emit('join:room', roomId);
    setMobileSidebarOpen(false);
  };

  const toggleDND = () => {
    const newVal = !isDND;
    setIsDND(newVal);
    socket.emit('toggle:dnd', newVal);
    if (newVal) {
      setShowDNDToast(true);
      setTimeout(() => setShowDNDToast(false), 5000);
    } else {
      setShowDNDToast(false);
    }
  };

  const toggleCategory = (id: string) => {
    setCollapsedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };
  
  const handleClosePrivateChat = (otherId: string) => {
    setPrivateThreads(prev => {
      const next = { ...prev };
      delete next[otherId];
      return next;
    });
    if (activePrivateChat === otherId) {
      setActivePrivateChat(null);
    }
  };

  const handleBlock = (userId: string) => {
    socket.emit('block:user', userId);
    setBlockedUsers(prev => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  };

  const handleUnblock = (userId: string) => {
    socket.emit('unblock:user', userId);
    setBlockedUsers(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleReport = (userId: string) => {
    socket.emit('report:user', userId);
    setReportNotification({
      visible: true,
      message: 'You have reported this user.',
      type: 'success'
    });
    setTimeout(() => setReportNotification(null), 3000);
  };

  const roomCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Initialize with server counts
    rooms.forEach(r => {
      counts[r.id.toLowerCase()] = r.userCount || 0;
    });

    // Add dummy users (they are always local)
    dummyUsers.forEach(u => {
      const roomKey = (u.currentRoom || 'lobby').toLowerCase();
      counts[roomKey] = (counts[roomKey] || 0) + 1;
    });
    
    // For General Lobby, we want to show the TOTAL global count (Real + Dummies)
    // as it represents the overall community
    const globalRealUsers = rooms.reduce((acc, r) => acc + (r.userCount || 0), 0);
    // Note: server userCount usually already includes the current user in their respective room
    counts['lobby'] = globalRealUsers + dummyUsers.length;
    
    // Ensure it's at least 1 (the current user)
    if (counts['lobby'] < 1) counts['lobby'] = 1;

    return counts;
  }, [rooms, dummyUsers, onlineUsers, user.id]);

  const currentRoomData = rooms.find(r => r.id === currentRoom);
  const currentChatName = activePrivateChat 
    ? [...onlineUsers, ...dummyUsers].find(u => u.id === activePrivateChat)?.nickname || 
      (privateThreads[activePrivateChat]?.length > 0
        ? (privateThreads[activePrivateChat][0].senderId === activePrivateChat 
            ? privateThreads[activePrivateChat][0].senderName 
            : "Private Chat")
        : "Private Chat")
    : currentRoom === 'lobby' ? 'General Lobby' : (currentRoomData?.name || "The Lobby");

  const peopleCount = [...onlineUsers, ...dummyUsers].filter(u => 
    currentRoom === 'lobby' ||
    (u.currentRoom?.toLowerCase() === currentRoom.toLowerCase()) || 
    (u.id === user.id)
  ).length;

  return (
    <div className="h-full flex flex-col bg-bg text-text overflow-hidden font-sans">
      
      {/* TOP PRIVACY BAR - CONDENSED */}
      <div className="bg-surface py-1 text-center border-b border-border shrink-0">
        <span className="text-[9px] uppercase font-black tracking-widest text-text-muted flex items-center justify-center gap-1.5">
          <Lock size={10} className="text-brand" />
          Your conversations stay private. No personal data stored.
        </span>
      </div>

      {/* MAIN HEADER - CONDENSED */}
      <header className="h-10 flex-shrink-0 flex items-center justify-between px-4 md:px-10 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-40 relative">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-1.5 hover:bg-surface-hover rounded-lg text-text-muted"
            aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
          >
            <MoreVertical size={18} className={mobileSidebarOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
          </button>
          <div className="flex items-center gap-1.5">
            <Logo size="sm" />
          </div>
        </div>

        {/* Centered Welcome Message - Only show on desktop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex">
          <span className="text-xs font-medium text-text-muted pointer-events-auto">
            Welcome, <span className="text-text-highlight font-black">{user.nickname}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-1.5 md:gap-2">
             <span className="text-[9px] font-black uppercase text-text-highlight tracking-widest flex items-center gap-1">
               {isDND ? <BellOff size={10} /> : <Bell size={10} />} DND
             </span>
             <button 
               onClick={toggleDND}
               className={`w-8 h-4 rounded-full relative transition-all duration-300 ${isDND ? 'bg-brand' : 'bg-border'}`}
               aria-label={isDND ? "Disable Do Not Disturb" : "Enable Do Not Disturb"}
               aria-pressed={isDND}
             >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${isDND ? 'left-4.5' : 'left-0.5'}`} />
             </button>
          </div>
          <div className="flex items-center">
            <button 
              onClick={onExit}
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-surface/50 hover:bg-red-500/10 text-text-highlight hover:text-red-500 rounded-lg transition-all font-black text-[9px] uppercase tracking-widest border border-border hover:border-red-500/20"
            >
              <DoorOpen size={12} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CONTENT */}
      <div className="flex-1 flex overflow-hidden md:px-4 md:py-3 gap-3 relative pb-16 md:pb-0">
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* LEFT SIDEBAR CATEGORIES */}
        <aside className={`
          fixed inset-y-0 left-0 top-10 md:static md:w-60 flex flex-col gap-2 flex-shrink-0 z-40 transition-transform duration-300 ease-in-out
          bg-surface md:bg-transparent p-3 md:p-0 shadow-2xl md:shadow-none
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-[75%] sm:w-60
        `}>
           {/* Sidebar Close button for mobile */}
           <div className="flex items-center justify-between md:hidden mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-brand border-b-2 border-brand/20">Menu</span>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 hover:bg-surface-hover rounded-lg text-text-muted"
              >
                <X size={16} />
              </button>
           </div>
           {/* Navigation Tabs - COMPACT */}
           <div className="flex bg-border/20 p-0.5 rounded-lg border border-border/10">
              {(['Rooms', 'Messages', 'People'] as Tab[]).map(tab => {
                let count = 0;
                if (tab === 'Messages') count = Object.keys(privateThreads).length;
                if (tab === 'Rooms') count = rooms.length;
                if (tab === 'People') {
                  // Create a comprehensive list including the current user
                  const allUsers = [...onlineUsers, ...dummyUsers];
                  const isSelfInList = allUsers.some(u => u.id === user.id);
                  const finalUserList = isSelfInList ? allUsers : [...allUsers, { id: user.id, nickname: user.nickname, gender: user.gender, currentRoom }];

                  count = finalUserList.filter(u => 
                    currentRoom === 'lobby' ||
                    (u.currentRoom?.toLowerCase() === currentRoom.toLowerCase()) || 
                    (u.id === user.id)
                  ).length;
                }
                const hasUnread = tab === 'Messages' && unreadThreads.size > 0;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === tab ? 'bg-surface text-brand shadow-sm' : 'text-text-muted hover:text-text'
                    }`}
                    title={tab}
                    aria-label={`${tab} view`}
                    aria-pressed={activeTab === tab}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={`p-1.5 rounded-lg flex items-center justify-center font-black relative transition-all ${
                        activeTab === tab ? 'bg-brand/10 text-brand' : 'bg-transparent text-text-muted'
                      }`}>
                        {tab === 'Rooms' && <Hash size={16} strokeWidth={activeTab === tab ? 3 : 2} />}
                        {tab === 'Messages' && <MessageSquare size={16} strokeWidth={activeTab === tab ? 3 : 2} />}
                        {tab === 'People' && <Users size={16} strokeWidth={activeTab === tab ? 3 : 2} />}
                        
                        {count > 0 && (
                          <div className={`absolute -top-1 -right-1.5 px-1.5 py-0.5 rounded-full text-[7px] flex items-center justify-center font-black shadow-sm ${
                            activeTab === tab ? 'bg-brand text-white' : 'bg-border text-text-muted'
                          }`}>
                            {count}
                          </div>
                        )}
                        {hasUnread && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-surface animate-pulse shadow-sm shadow-red-500/50" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
           </div>

           {/* Content List Card */}
           <div className="flex-1 bg-surface rounded-[2rem] border border-border shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
                 {activeTab === 'Rooms' && (
                   <div className="space-y-6">
                     {/* THE LOBBY - SPECIAL ITEM */}
                     <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand px-2">The Lobby</span>
                        <button 
                          onClick={() => switchRoom('lobby')}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                            currentRoom === 'lobby' ? 'bg-brand/10 text-brand shadow-sm' : 'hover:bg-surface-hover text-text-muted'
                          }`}
                        >
                           <div className="flex items-center gap-3">
                             <MessageSquare size={16} className={currentRoom === 'lobby' ? 'text-brand' : 'opacity-40'} />
                             <span className="text-xs font-bold truncate max-w-[140px] tracking-tight text-text-highlight">General Lobby</span>
                           </div>
                           <div className="flex items-center gap-1.5 shrink-0">
                              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${currentRoom === 'lobby' ? 'bg-white' : 'bg-brand'}`} />
                              <div className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-[0_2px_10px_-3px_rgba(0,0,0,0.2)] flex items-center justify-center min-w-[32px] transition-all ${
                                currentRoom === 'lobby' ? 'bg-white text-brand transform scale-110' : 'bg-brand/10 text-brand'
                              }`}>
                                {roomCounts['lobby']}
                              </div>
                           </div>
                        </button>
                     </div>

                     {CATEGORIES.map(category => {
                       const isCollapsed = collapsedCategories.includes(category.id);
                       const filteredRooms = rooms.filter(r => {
                         if (r.id === 'lobby') return false; // Handled separately
                         if (category.id === 'local') {
                           return ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'thiruvananthapuram', 'lucknow', 'jaipur', 'chandigarh'].includes(r.id);
                         }
                         if (category.id === 'global') {
                           return ['usa', 'uk', 'canada', 'australia', 'germany', 'france', 'uae', 'saudi', 'qatar', 'singapore', 'japan', 'south_korea', 'thailand', 'philippines', 'malaysia', 'bahrain'].includes(r.id);
                         }
                         return false;
                       }).sort((a, b) => a.name.localeCompare(b.name));

                       return (
                         <div key={category.id} className="space-y-2">
                            <div 
                              onClick={() => toggleCategory(category.id)}
                              className="flex items-center justify-between group cursor-pointer px-2"
                            >
                              <div className="flex items-center gap-2">
                                 <ChevronDown 
                                   size={14} 
                                   className={`text-text-muted transition-transform ${isCollapsed ? '-rotate-90' : ''}`} 
                                 />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-brand">{category.name}</span>
                              </div>
                              <Plus size={14} className="text-text-muted/40 group-hover:text-text-muted transition-colors" />
                            </div>
                            
                            {!isCollapsed && (
                              <div className="space-y-1">
                                {filteredRooms.map(room => (
                                  <button 
                                    key={room.id}
                                    onClick={() => switchRoom(room.id)}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                      currentRoom === room.id ? 'bg-brand/10 text-brand shadow-sm' : 'hover:bg-surface-hover text-text-muted'
                                    }`}
                                  >
                                     <div className="flex items-center gap-3">
                                        <Hash size={16} className={currentRoom === room.id ? 'text-brand' : 'opacity-40'} />
                                        <span className="text-xs font-bold truncate max-w-[140px] tracking-tight text-text-highlight">{room.name}</span>
                                     </div>
                                     <div className="flex items-center gap-1.5 shrink-0">
                                        <div className={`w-1 h-1 rounded-full ${currentRoom === room.id ? 'bg-brand' : 'bg-slate-300'}`} />
                                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm flex items-center justify-center min-w-[28px] transition-all ${
                                          currentRoom === room.id ? 'bg-brand text-white transform scale-110' : 'bg-surface-hover text-text-muted hover:bg-brand/5 hover:text-brand'
                                        }`}>
                                          {roomCounts[room.id.toLowerCase()] || 0}
                                        </div>
                                     </div>
                                  </button>
                                ))}
                              </div>
                            )}
                         </div>
                       );
                     })}
                   </div>
                 )}
                 
                 {activeTab === 'People' && (
                    <div className="space-y-4">
                      {/* Sort Controls */}
                      <div className="flex items-center justify-between px-2 pb-2 border-b border-border">
                        <div className="flex gap-2">
                           <button 
                             onClick={() => setPeopleSortBy('alphabet')}
                             className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded ${peopleSortBy === 'alphabet' ? 'bg-brand text-white' : 'bg-surface-hover text-text-muted'}`}
                           >A-Z</button>
                           <button 
                             onClick={() => setPeopleSortBy('gender')}
                             className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded ${peopleSortBy === 'gender' ? 'bg-brand text-white' : 'bg-surface-hover text-text-muted'}`}
                           >Gender</button>
                        </div>
                        <button 
                          onClick={() => setPeopleSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="text-[8px] font-black uppercase tracking-tighter text-brand hover:text-brand-dark"
                        >
                          {peopleSortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                        </button>
                      </div>

                      <div className="space-y-1">
                        {(() => {
                           const allUsers = [...onlineUsers, ...dummyUsers];
                           const isSelfInList = allUsers.some(u => u.id === user.id);
                           const finalUserList = isSelfInList ? allUsers : [...allUsers, { id: user.id, nickname: user.nickname, gender: user.gender, currentRoom }];
                           
                           return finalUserList
                            .filter(u => 
                              currentRoom === 'lobby' ||
                              (u.currentRoom?.toLowerCase() === currentRoom.toLowerCase()) || 
                              (u.id === user.id)
                            )
                            .sort((a, b) => {
                              let comparison = 0;
                              if (peopleSortBy === 'alphabet') {
                                comparison = a.nickname.localeCompare(b.nickname);
                              } else {
                                comparison = (a.gender || '').localeCompare(b.gender || '');
                              }
                              return peopleSortOrder === 'asc' ? comparison : -comparison;
                            })
                            .map(u => (
                            <div 
                              key={u.id} 
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-hover transition-all group"
                            >
                                <button 
                                  onClick={() => {
                                    if (u.id === user.id) return;
                                    setActivePrivateChat(u.id);
                                    setMobileSidebarOpen(false);
                                  }}
                                  className="flex items-center gap-3 flex-1 text-left"
                                >
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                     u.gender === 'Male' ? 'bg-blue-500 text-white' :
                                     u.gender === 'Female' ? 'bg-pink-500 text-white' :
                                     u.gender === 'Non-binary' ? 'bg-indigo-500 text-white' :
                                     'bg-slate-500 text-white'
                                   }`}>
                                      {u.gender === 'Male' && <Mars size={16} />}
                                      {u.gender === 'Female' && <Venus size={16} />}
                                      {u.gender === 'Non-binary' && <span>NB</span>}
                                      {(u.gender === 'Prefer not to say' || u.gender === 'Other' || !u.gender) && <span>P</span>}
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2">
                                       <p className="text-xs font-bold tracking-tight text-text-highlight">
                                         {u.nickname} {u.id === user.id && '(You)'}
                                       </p>
                                       {u.isDND && <BellOff size={12} className="text-orange-500 fill-orange-500/10" title="DND Enabled" />}
                                       {blockedUsers.has(u.id) && <Shield size={12} className="text-red-500" title="Restricted" />}
                                     </div>
                                     <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">{u.gender || 'Private'}</p>
                                  </div>
                               </button>
                               
                               {u.id !== user.id && (
                                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                      onClick={() => blockedUsers.has(u.id) ? handleUnblock(u.id) : handleBlock(u.id)}
                                      className={`p-1.5 rounded-lg transition-colors ${blockedUsers.has(u.id) ? 'bg-red-500/10 text-red-500' : 'bg-surface-hover text-text-muted hover:text-text'}`}
                                      title={blockedUsers.has(u.id) ? "Unrestrict" : "Restrict"}
                                      aria-label={blockedUsers.has(u.id) ? `Unrestrict ${u.nickname}` : `Restrict ${u.nickname}`}
                                    >
                                       <Shield size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleReport(u.id)}
                                      className="p-1.5 rounded-lg bg-surface-hover text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
                                      title="Report"
                                    >
                                       <ShieldAlert size={12} />
                                    </button>
                                 </div>
                               )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                 )}
                                {activeTab === 'Messages' && (
                    <div className="space-y-1">
                      {Object.keys(privateThreads).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-3">
                            <Plus size={20} className="text-text-muted/40" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No conversations yet</p>
                          <p className="text-[9px] text-text-muted/60 mt-1">Select a user from the People tab to start a private chat.</p>
                        </div>
                      ) : (
                        Object.keys(privateThreads).map(otherId => {
                          const thread = privateThreads[otherId];
                          const lastMsg = thread[thread.length - 1];
                          const otherUser = [...onlineUsers, ...dummyUsers].find(u => u.id === otherId);
                          
                          // Fallback to name from the last message sent by them or to them
                          const displayName = otherUser?.nickname || 
                            (lastMsg.senderId === otherId ? lastMsg.senderName : "Chat Partner");

                          return (
                            <div 
                              key={otherId} 
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all group relative ${activePrivateChat === otherId ? 'bg-brand/10 shadow-sm' : unreadThreads.has(otherId) ? 'bg-brand/5 border border-brand/10' : 'hover:bg-surface-hover/50'}`}
                            >
                               {unreadThreads.has(otherId) && (
                                 <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-full" />
                               )}
                               <button 
                                 onClick={() => {
                                   setActivePrivateChat(otherId);
                                   setMobileSidebarOpen(false);
                                   setUnreadThreads(prev => {
                                     if (!prev.has(otherId)) return prev;
                                     const next = new Set(prev);
                                     next.delete(otherId);
                                     return next;
                                   });
                                 }}
                                 className="flex items-center gap-3 flex-1 min-w-0 text-left"
                               >
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-sm relative ${
                                     otherUser?.gender === 'Male' ? 'bg-blue-500 text-white' :
                                     otherUser?.gender === 'Female' ? 'bg-pink-500 text-white' :
                                     otherUser?.gender === 'Non-binary' ? 'bg-indigo-500 text-white' :
                                     'bg-slate-500 text-white'
                                   }`}>
                                      {otherUser?.gender === 'Male' && <Mars size={16} />}
                                      {otherUser?.gender === 'Female' && <Venus size={16} />}
                                      {otherUser?.gender === 'Non-binary' && <span>NB</span>}
                                      {(otherUser?.gender === 'Prefer not to say' || otherUser?.gender === 'Other' || !otherUser?.gender) && <span>P</span>}
                                      {otherUser && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" title="Online in this room" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <p className="text-xs font-bold tracking-tight truncate text-text-highlight">{displayName}</p>
                                          {globalStatuses[otherId]?.isDND && <BellOff size={11} className="text-orange-500 shrink-0" />}
                                          {blockedUsers.has(otherId) && <Shield size={10} className="text-red-500 shrink-0" />}
                                        </div>
                                        <span className={`text-[8px] opacity-60 ${unreadThreads.has(otherId) ? 'text-brand font-black' : 'text-text-muted'}`}>
                                          {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                     </div>
                                     <p className={`text-[10px] truncate ${unreadThreads.has(otherId) ? 'text-text font-bold' : 'text-text-muted'}`}>{lastMsg.content}</p>
                                  </div>
                               </button>
                               
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClosePrivateChat(otherId);
                                    }}
                                    className="p-1.5 rounded-lg bg-surface-hover text-text-muted hover:text-text"
                                    title="Close Chat"
                                  >
                                     <Plus size={12} className="rotate-45" />
                                  </button>
                                   <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      blockedUsers.has(otherId) ? handleUnblock(otherId) : handleBlock(otherId);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${blockedUsers.has(otherId) ? 'bg-red-500/10 text-red-500' : 'bg-surface-hover text-text-muted hover:text-text'}`}
                                    title={blockedUsers.has(otherId) ? "Unrestrict" : "Restrict"}
                                  >
                                     <Shield size={12} />
                                  </button>
                               </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  
                  {/* Adsterra Native Banner in Sidebar Bottom */}
                  <div className="mt-auto p-2">
                    <AdUnit id="1418012d844b1648216870293d3858dc" format="native" className="rounded-xl border border-border bg-surface-hover/20" />
                  </div>
              </div>
           </div>
        </aside>

        {/* CENTER CHAT DISPLAY WINDOW */}
        <main className="flex-1 bg-surface md:rounded-[2.5rem] border-x md:border border-border flex flex-col overflow-hidden relative shadow-sm z-10 w-full">
           <AnimatePresence>
             {reportNotification && (
               <motion.div
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm"
               >
                 <div className={`
                   ${reportNotification.type === 'success' ? 'bg-green-600' : reportNotification.type === 'warning' ? 'bg-red-600' : 'bg-brand'}
                   text-white p-3.5 rounded-2xl shadow-2xl flex items-start gap-3 border border-white/10
                 `}>
                   <div className="shrink-0 p-1.5 bg-white/10 rounded-lg">
                     <ShieldAlert size={16} />
                   </div>
                   <div className="flex-1">
                     <p className="text-[11px] font-bold leading-snug">
                       {reportNotification.message}
                     </p>
                   </div>
                   <button onClick={() => setReportNotification(null)} className="shrink-0 opacity-60 hover:opacity-100">
                     <X size={14} />
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <AnimatePresence>
             {showDNDToast && (
               <motion.div
                 initial={{ opacity: 0, y: 20, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 20, scale: 0.95 }}
                 className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md px-4"
               >
                 <div className="bg-text-highlight text-white p-3.5 rounded-xl shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md bg-opacity-95">
                   <div className="flex items-center justify-center gap-3 flex-1">
                     <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                       <BellOff size={14} className="text-white" />
                     </div>
                     <p className="text-[11px] font-bold text-white leading-tight text-center">
                       Your DND is on. Turn it off to receive private messages.
                     </p>
                   </div>
                   <button 
                     onClick={() => setShowDNDToast(false)}
                     className="p-1 hover:bg-white/10 rounded-md transition-colors shrink-0"
                   >
                     <X size={14} />
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
           {/* Window Header */}
           <div className="p-3 md:p-4 flex items-center gap-3 border-b border-border bg-surface-hover/20">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center border border-brand/5">
                 <MessageSquare size={20} className="text-brand" />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                   <h2 className="text-lg font-black tracking-tight text-text-highlight">{currentChatName}</h2>
                   {activePrivateChat && globalStatuses[activePrivateChat]?.isDND && (
                     <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md border border-orange-500/10">
                       <BellOff size={8} /> DND
                     </span>
                   )}
                 </div>
                 <p className="text-[11px] text-text-muted font-medium">
                    {activePrivateChat ? "Private Messaging" : (currentRoomData?.description || "A place for open, respectful conversations")}
                 </p>
              </div>
           </div>

            {/* Restriction Banners */}
            {activePrivateChat && (
              <>
                {blockedUsers.has(activePrivateChat) && (
                  <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                       <Shield size={14} className="text-red-500" />
                       <span className="text-[11px] font-bold text-red-600">You have restricted this user. Unrestrict them to receive private messages.</span>
                    </div>
                    <button 
                      onClick={() => handleUnblock(activePrivateChat)}
                      className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors"
                    >
                      Unrestrict
                    </button>
                  </div>
                )}
                {whoBlockedMe.has(activePrivateChat) && (
                  <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2 flex items-center gap-2 animate-in slide-in-from-top-1">
                    <ShieldAlert size={14} className="text-orange-500" />
                    <span className="text-[11px] font-bold text-orange-600">Communication with this user is currently restricted.</span>
                  </div>
                )}
              </>
            )}

           {/* Message Buffer Flow */}
           <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
              {!activePrivateChat && (
                <div className="flex justify-center mb-6">
                   <div className="bg-border/30 px-3 py-1.5 rounded-full text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] border border-border">
                      {currentRoom === 'lobby' ? 'Welcome to General Lobby' : `Welcome to ${currentChatName}`}
                   </div>
                </div>
              )}

              <div className="bg-brand/5 border border-brand/10 p-4 rounded-xl mb-6 mx-auto max-w-[90%]">
                 <p className="text-[11px] text-brand/60 text-center leading-relaxed font-medium">
                   Please be respectful. Treat others kindly and keep conversations appropriate. Indecent behavior can be anonymously reported. 
                   <br/><br/>
                   <span className="text-text font-black">RULES:</span> 
                   <br/>
                   1. 5 reports result in an <span className="text-text font-bold">IP & Nickname ban for 30 minutes</span>.
                   <br/>
                   2. Enable <span className="text-text font-bold">DND</span> (top right) to block incoming private messages.
                   <br/>
                   3. <span className="text-text font-bold">Restrict</span> annoying users to block their private messages.
                 </p>
              </div>

               {((activePrivateChat ? (privateThreads[activePrivateChat] || []) : (roomMessages[currentRoom] || []))).length === 0 && (
                 <div className="flex flex-col items-center justify-center py-10 opacity-30 select-none pointer-events-none">
                   <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                     <MessageSquare size={32} className="text-brand" />
                   </div>
                   <p className="text-sm font-black uppercase tracking-widest text-text-muted">No messages yet</p>
                   <p className="text-[10px] font-bold text-text-muted/60">
                     {activePrivateChat ? `Start a private conversation with ${currentChatName}` : 'Say hi to start the conversation!'}
                   </p>
                 </div>
               )}

              {((activePrivateChat ? (privateThreads[activePrivateChat] || []) : (roomMessages[currentRoom] || []))).map((msg, idx) => (
                <div key={msg.id} className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2">
                   <div className={`flex items-center gap-2 ${msg.senderId === user.id ? 'justify-end mr-4' : 'ml-4'}`}>
                      <span className="text-[10px] font-black text-text-highlight uppercase tracking-widest">{msg.senderName}</span>
                      <span className="text-[8px] text-text-muted/40 font-bold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm leading-relaxed font-medium shadow-sm transition-all ${
                     msg.senderId === user.id 
                       ? 'bg-brand text-white self-end rounded-tr-none' 
                       : 'bg-bg/50 text-text self-start rounded-tl-none border border-border'
                   }`}>
                      {formatChatMessage(msg.content)}
                   </div>
                </div>
              ))}
           </div>

           {/* Message Input Container */}
           <div className="p-4 pt-0 transition-all">
              {error && (
                <div className="mb-2 text-center animate-in fade-in slide-in-from-top-2">
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                     {error}
                   </span>
                </div>
              )}
              
              {activePrivateChat && whoBlockedMe.has(activePrivateChat) ? (
                <div className="bg-orange-500/5 rounded-2xl border border-orange-500/10 py-5 flex flex-col items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <ShieldAlert size={20} className="text-orange-500 opacity-40" />
                  <p className="text-[11px] font-bold text-orange-600 text-center px-6 leading-tight">
                    You cannot send messages to this user as they have restricted you.
                  </p>
                </div>
              ) : (
                <>
                  {activePrivateChat && globalStatuses[activePrivateChat]?.isDND && (
                    <div className="mb-2 text-center">
                       <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
                         Recipient has DND enabled
                       </span>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                     <div className="flex-1 relative group">
                        <label htmlFor="chat-input" className="sr-only">Type a message</label>
                        <input 
                          id="chat-input"
                          type="text" 
                          value={inputText}
                          onChange={(e) => {
                            setInputText(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder={`Message ${currentChatName}...`} 
                          className="w-full bg-bg/50 rounded-xl py-3 px-5 text-base md:text-sm focus:outline-none border border-border focus:border-brand transition-all font-medium placeholder:text-text-muted/30 shadow-inner"
                        />
                     </div>
                     <div className="relative" ref={emojiPickerRef}>
                        <button 
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${showEmojiPicker ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-surface border-border text-text-muted hover:text-brand hover:border-brand/30 shadow-sm'}`}
                          title="Add emoji"
                          aria-label="Toggle emoji picker"
                        >
                          <Smile size={24} strokeWidth={2} />
                        </button>
                        
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full right-0 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border"
                            >
                               <EmojiPicker 
                                 onEmojiClick={onEmojiClick}
                                 autoFocusSearch={false}
                                 theme={Theme.LIGHT}
                                 width={320}
                                 height={400}
                               />
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                     <button 
                       type="submit"
                       disabled={!inputText.trim()}
                       className="w-14 h-14 bg-brand hover:bg-brand-dark disabled:opacity-30 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 transition-all active:scale-95 text-white flex-shrink-0"
                       aria-label="Send message"
                     >
                        <Send size={20} />
                     </button>
                  </form>
                </>
              )}
           </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - FIXED AT BOTTOM */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-4 z-[45] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => {
            setActiveTab('Rooms');
            setMobileSidebarOpen(true);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'Rooms' && mobileSidebarOpen ? 'text-brand' : 'text-text-muted hover:text-text'
          }`}
          aria-label="Rooms tab"
          aria-pressed={activeTab === 'Rooms' && mobileSidebarOpen}
        >
          <Hash size={20} className={activeTab === 'Rooms' && mobileSidebarOpen ? 'stroke-[3px]' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">Rooms</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('Messages');
            setMobileSidebarOpen(true);
          }}
          className={`flex flex-col items-center gap-1 transition-all relative ${
            activeTab === 'Messages' && mobileSidebarOpen ? 'text-brand' : 'text-text-muted hover:text-text'
          }`}
          aria-label="Messages tab"
          aria-pressed={activeTab === 'Messages' && mobileSidebarOpen}
        >
          <div className="relative">
            <MessageSquare size={20} className={activeTab === 'Messages' && mobileSidebarOpen ? 'stroke-[3px]' : ''} />
            {unreadThreads.size > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface animate-pulse">
                {unreadThreads.size}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Messages</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('People');
            setMobileSidebarOpen(true);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'People' && mobileSidebarOpen ? 'text-brand' : 'text-text-muted hover:text-text'
          }`}
          aria-label="People tab"
          aria-pressed={activeTab === 'People' && mobileSidebarOpen}
        >
          <div className="relative">
             <Users size={20} className={activeTab === 'People' && mobileSidebarOpen ? 'stroke-[3px]' : ''} />
             {peopleCount > 0 && (
               <span className="absolute -top-1 -right-3 bg-brand/10 text-brand text-[8px] font-black px-1 rounded-full animate-pulse">
                 {peopleCount}
               </span>
             )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">People</span>
        </button>
      </nav>
    </div>
  );
};

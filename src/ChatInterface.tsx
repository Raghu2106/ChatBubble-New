import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageSquare, Globe, User, MoreVertical, Menu,
  Send, ShieldAlert, DoorOpen, Bell, BellOff, RefreshCw,
  Lock, Search, Plus, ChevronDown, Music, Code, Zap,
  Moon, Hash, Shield, ChevronRight, Mars, Venus, X,
  Smile
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Logo } from './components/Logo';
import { socket } from './socket';
import { ChatMessage, Room, Gender, DummyUser } from './types';
import { AdUnit } from './components/AdUnit';

// Helper to sanitize message content and strip clickable links/HTML
const formatChatMessage = (content: string) => {
  return content.replace(/<[^>]*>/g, '');
};

interface ChatInterfaceProps {
  user: { nickname: string; id: string; gender?: Gender; interests: string[] };
  onExit: () => void;
  error?: string | null;
  setError: (err: string | null) => void;
  dummyUsers: DummyUser[];
}

type Tab = 'Rooms' | 'Messages' | 'People';
type SortOption = 'alphabet' | 'gender';
type SortOrder = 'asc' | 'desc';

const CATEGORIES = [
  { id: 'local', name: 'Local Connections', icon: Globe },
  { id: 'global', name: 'Global Connections', icon: Globe },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onExit, error, setError, dummyUsers }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Rooms');
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
  const [showLegal, setShowLegal] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Memoized sorted private chat IDs by last message timestamp
  const sortedPrivateChatIds = useMemo(() => {
    return Object.keys(privateThreads).sort((a, b) => {
      const threadA = privateThreads[a] || [];
      const threadB = privateThreads[b] || [];
      const lastMsgA = threadA[threadA.length - 1];
      const lastMsgB = threadB[threadB.length - 1];
      
      const timeA = lastMsgA ? lastMsgA.timestamp : 0;
      const timeB = lastMsgB ? lastMsgB.timestamp : 0;
      
      // Secondary sort by unread status (unread on top if timestamps match)
      if (timeB === timeA) {
        const unreadA = unreadThreads.has(a);
        const unreadB = unreadThreads.has(b);
        if (unreadA !== unreadB) {
          return unreadB ? 1 : -1;
        }
        return b.localeCompare(a);
      }
      
      return timeB - timeA;
    });
  }, [privateThreads, unreadThreads]);

  const roomMessagesRef = useRef(roomMessages);
  const privateThreadsRef = useRef(privateThreads);

  useEffect(() => {
    roomMessagesRef.current = roomMessages;
  }, [roomMessages]);

  useEffect(() => {
    privateThreadsRef.current = privateThreads;
  }, [privateThreads]);

  // Total removal of ResponsePools and Bot logic as per request.
  
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
    // Clear old error when switching chat or room
    setError(null);
    
    if (activePrivateChat) {
      // Clear unread
      setUnreadThreads(prev => {
        if (!prev.has(activePrivateChat)) return prev;
        const next = new Set(prev);
        next.delete(activePrivateChat);
        return next;
      });

      // Unified online check for both dummies and real users
      const isDummy = activePrivateChat.startsWith('dummy-');
      const isOnline = isDummy 
        ? dummyUsers.some(u => u.id === activePrivateChat)
        : onlineUsers.some(u => u.id === activePrivateChat);

      if (!isOnline) {
        setError("User is no longer online.");
      }
    }
  }, [activePrivateChat, currentRoom, dummyUsers, onlineUsers, setError]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setError(null);
    if (activePrivateChat) {
      // Immediate online check
      const isDummy = activePrivateChat.startsWith('dummy-');
      const isOnline = isDummy 
        ? dummyUsers.some(u => u.id === activePrivateChat)
        : onlineUsers.some(u => u.id === activePrivateChat);

      if (!isOnline) {
        setError("User is no longer online.");
        return;
      }

      if (isDummy) {
        // Notify server so auto-reply can trigger. server-echo will handle UI update.
        socket.emit('send:private', { recipientId: activePrivateChat, content: inputText });
      } else {
        // Real user: server handles the check globally (across rooms)
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
    setError(null);
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
      
      {/* MAIN HEADER - TIGHTER */}
      <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
          >
            <Menu size={22} className={mobileSidebarOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
          </button>
          <Logo size="md" />
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Welcome,</span>
           <span className="text-[11px] font-black text-brand uppercase tracking-tight leading-none truncate max-w-[120px]">{user.nickname}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={toggleDND}
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all duration-300 ${
              isDND 
                ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm shadow-amber-100' 
                : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50'
            }`}
             title={isDND ? "Disable Do Not Disturb" : "Enable Do Not Disturb"}
          >
            {isDND ? <BellOff size={16} /> : <Bell size={16} />}
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">DND</span>
          </button>
          
          <button 
            onClick={onExit}
            className="group flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-900 hover:bg-red-600 border border-slate-800 hover:border-red-500 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-slate-900/10"
          >
            <DoorOpen size={16} />
            <span className="hidden sm:inline">Exit App</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden lg:pl-3 lg:py-3 gap-3 relative pb-16 md:pb-0">
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-30 md:hidden"
            />
          )}
        </AnimatePresence>

         {/* LEFT NAVIGATOR - SLIMMER AND MODERN */}
        <aside className={`
          fixed inset-y-0 left-0 top-12 md:static flex flex-col gap-3 flex-shrink-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          bg-surface md:bg-transparent md:w-56 p-2 md:p-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-[85%] max-w-[300px] md:max-w-none shadow-2xl md:shadow-none
        `}>
           {/* Navigation Tabs - ROUNDED PILL DESIGN */}
           <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
              {(['Rooms', 'Messages', 'People'] as Tab[]).map(tab => {
                let count = 0;
                if (tab === 'Messages') count = Object.keys(privateThreads).length;
                if (tab === 'Rooms') count = rooms.length;
                if (tab === 'People') {
                  const allUsers = [...onlineUsers, ...dummyUsers];
                  const isSelfInList = allUsers.some(u => u.id === user.id);
                  const finalUserList = isSelfInList ? allUsers : [...allUsers, { id: user.id, nickname: user.nickname, gender: user.gender, currentRoom }];
                  count = finalUserList.filter(u => 
                    currentRoom === 'lobby' || (u.currentRoom?.toLowerCase() === currentRoom.toLowerCase()) || (u.id === user.id)
                  ).length;
                }
                const hasUnread = tab === 'Messages' && unreadThreads.size > 0;
 
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all relative ${
                      activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        {tab === 'Rooms' && <Hash size={14} />}
                        {tab === 'Messages' && <MessageSquare size={14} />}
                        {tab === 'People' && <Users size={14} />}
                        
                        {count > 0 && (
                          <div className={`absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-full text-[8px] flex items-center justify-center font-black ${
                            activeTab === tab ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {count}
                          </div>
                        )}
                        {hasUnread && (
                          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                        )}
                      </div>
                      <span className="mt-1 hidden sm:block">{tab}</span>
                    </div>
                  </button>
                );
              })}
           </div>

           {/* Explorer Card */}
           <div className="flex-1 bg-white md:bg-surface rounded-t-[1.5rem] md:rounded-[1.5rem] border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-4">
                 {activeTab === 'Rooms' && (
                   <div className="space-y-4">
                     {/* THE LOBBY - SPECIAL ITEM */}
                     <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand px-2">The Lobby</span>
                        <button 
                          onClick={() => switchRoom('lobby')}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 group ${
                            currentRoom === 'lobby' ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20' : 'hover:bg-slate-50 text-slate-500'
                          }`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${currentRoom === 'lobby' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-brand/10 group-hover:text-brand'}`}>
                                <MessageSquare size={16} />
                              </div>
                              <span className="text-xs font-bold tracking-tight">General Lobby</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${currentRoom === 'lobby' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {roomCounts['lobby']}
                              </span>
                              <div className={`w-1.5 h-1.5 rounded-full ${currentRoom === 'lobby' ? 'bg-brand shadow-[0_0_8px_brand]' : 'bg-green-500'} animate-pulse`} />
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
                                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                                      currentRoom === room.id ? 'bg-indigo-50 text-brand ring-1 ring-brand/10' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                                    }`}
                                  >
                                     <div className="flex items-center gap-3">
                                        <Hash size={16} className={currentRoom === room.id ? 'text-brand' : 'opacity-40 group-hover:opacity-70'} />
                                        <span className={`text-[13px] font-medium tracking-tight truncate max-w-[140px]`}>{room.name}</span>
                                     </div>
                                     <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                       currentRoom === room.id ? 'bg-brand text-white shadow-sm shadow-brand/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                     }`}>
                                       {roomCounts[room.id.toLowerCase()] || 0}
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
                      <div className="flex items-center justify-between px-2 pb-1 border-b border-border">
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
                                if (comparison === 0) {
                                  comparison = a.nickname.localeCompare(b.nickname);
                                }
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
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-sm relative shrink-0 ${
                                     u.gender === 'Male' ? 'bg-blue-500 text-white' :
                                     u.gender === 'Female' ? 'bg-pink-500 text-white' :
                                     u.gender === 'Non-binary' ? 'bg-indigo-500 text-white' :
                                     'bg-slate-500 text-white'
                                   }`}>
                                      {u.gender === 'Male' && <Mars size={12} />}
                                      {u.gender === 'Female' && <Venus size={12} />}
                                      {u.gender === 'Non-binary' && <span>NB</span>}
                                      {(u.gender === 'Prefer not to say' || u.gender === 'Other' || !u.gender) && <span>P</span>}
                                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border border-white rounded-full transition-colors duration-500 ${u.id === user.id || onlineUsers.some(ou => ou.id === u.id) || dummyUsers.some(du => du.id === u.id) ? 'bg-green-500' : 'bg-slate-300'}`} />
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
                      {sortedPrivateChatIds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-3">
                            <Plus size={20} className="text-text-muted/40" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No conversations yet</p>
                          <p className="text-[9px] text-text-muted/60 mt-1">Select a user from the People tab to start a private chat.</p>
                        </div>
                      ) : (
                        sortedPrivateChatIds.map(otherId => {
                          const thread = privateThreads[otherId] || [];
                          const lastMsg = thread[thread.length - 1];
                          if (!lastMsg) return null; // Skip threads with no messages

                          const otherUser = [...onlineUsers, ...dummyUsers].find(u => u.id === otherId);
                          
                          // Fallback to name from the last message sent by them or to them
                          const displayName = otherUser?.nickname || 
                            (lastMsg.senderId === otherId ? lastMsg.senderName : "Chat Partner");

                          return (
                            <div 
                              key={otherId} 
                              className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all group relative border border-transparent ${activePrivateChat === otherId ? 'bg-indigo-50 border-indigo-100 shadow-sm' : unreadThreads.has(otherId) ? 'bg-brand/5 border-brand/20' : 'hover:bg-slate-50'}`}
                            >
                               {unreadThreads.has(otherId) && (
                                 <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-full" />
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
                                 className="flex items-center gap-2 flex-1 min-w-0 text-left"
                               >
                                   <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[8px] font-bold uppercase tracking-widest shadow-sm relative shrink-0 ${
                                     otherUser?.gender === 'Male' ? 'bg-indigo-100 text-indigo-600' :
                                     otherUser?.gender === 'Female' ? 'bg-rose-100 text-rose-600' :
                                     otherUser?.gender === 'Non-binary' ? 'bg-amber-100 text-amber-600' :
                                     'bg-slate-100 text-slate-600'
                                   }`}>
                                      {otherUser?.gender === 'Male' && <Mars size={12} />}
                                      {otherUser?.gender === 'Female' && <Venus size={12} />}
                                      {otherUser?.gender === 'Non-binary' && <span>NB</span>}
                                      {(otherUser?.gender === 'Prefer not to say' || otherUser?.gender === 'Other' || !otherUser?.gender) && <span>P</span>}
                                      <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-2 border-white rounded-full shadow-sm z-10 ${ (onlineUsers.some(u => u.id === otherId) || dummyUsers.some(du => du.id === otherId)) ? 'bg-green-500' : 'bg-slate-300'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <p className="text-[13px] font-extrabold tracking-tight truncate text-slate-900 leading-none">{displayName}</p>
                                        {globalStatuses[otherId]?.isDND && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                                      </div>
                                     <p className={`text-[10px] truncate leading-tight mt-0.5 ${unreadThreads.has(otherId) ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>{lastMsg.content}</p>
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
           <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-20">
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center border border-brand/5 shrink-0">
                 <MessageSquare size={18} className="text-brand" />
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                 <div className="flex items-center gap-2">
                   <h2 className="text-sm font-black tracking-tight text-text-highlight truncate">{currentChatName}</h2>
                   {activePrivateChat && globalStatuses[activePrivateChat]?.isDND && (
                     <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md border border-orange-500/10 shrink-0">
                       <BellOff size={8} /> DND
                     </span>
                   )}
                 </div>
                 <p className="text-[10px] text-text-muted font-bold truncate uppercase tracking-wider opacity-60">
                    {activePrivateChat ? "Private Messaging" : (currentRoomData?.description || "A place for open, respectful conversations")}
                 </p>
              </div>

              {activePrivateChat && (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => handleReport(activePrivateChat)}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-surface/50 hover:bg-orange-500/10 text-text-muted hover:text-orange-500 rounded-lg transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-widest border border-border hover:border-orange-500/20"
                    title="Report User"
                  >
                    <ShieldAlert size={14} />
                    <span className="hidden xs:inline">Report</span>
                  </button>
                  {!blockedUsers.has(activePrivateChat) && (
                    <button
                      onClick={() => handleBlock(activePrivateChat)}
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-surface/50 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-widest border border-border hover:border-red-500/20"
                      title="Restrict User"
                    >
                      <Shield size={14} />
                      <span className="hidden xs:inline">Restrict</span>
                    </button>
                  )}
                </div>
              )}
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
           <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
             <div className="flex flex-col justify-end min-h-full p-4 space-y-4">
                {/* Simplified Intro Info */}
                {((activePrivateChat ? (privateThreads[activePrivateChat] || []) : (roomMessages[currentRoom] || []))).length < 10 && (
                  <div className="flex flex-col items-center justify-center py-6 px-4 space-y-2 select-none">
                    <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
                      <Lock size={10} />
                      <span>End-to-End Privacy</span>
                      <div className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span>No Logs</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold text-center max-w-sm leading-tight uppercase opacity-80">
                      Messages are session-based. Follow our <button onClick={() => setShowLegal(true)} className="text-brand hover:underline cursor-pointer">Community Guidelines</button>.
                    </p>
                  </div>
                )}

                {/* System Message: User Joined */}
                <div className="flex flex-col items-center justify-center py-4 opacity-40">
                  <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       {user.nickname} joined the {activePrivateChat ? 'private chat' : currentChatName}
                    </p>
                  </div>
                </div>

                {/* Ad Placement in Chat Stream (Rare) */}
                {((activePrivateChat ? (privateThreads[activePrivateChat] || []) : (roomMessages[currentRoom] || []))).length > 10 && (
                  <div className="flex justify-center my-8">
                    <AdUnit id="b4df80321991ad2e3e953641360223af" format="300x250" className="opacity-60 scale-90" />
                  </div>
                )}

               {((activePrivateChat ? (privateThreads[activePrivateChat] || []) : (roomMessages[currentRoom] || []))).map((msg, idx) => (
                 <div key={msg.id} className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`flex items-center gap-2 px-1 ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                       <span className="text-[10px] font-bold text-text mb-0.5">{msg.senderName}</span>
                       <span className="text-[9px] text-text-muted/40 font-medium tracking-tighter">
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className={`max-w-[92%] sm:max-w-[80%] px-3 py-1.5 rounded-2xl text-[13px] sm:text-sm leading-relaxed shadow-sm transition-all ${
                      msg.senderId === user.id 
                        ? 'bg-brand text-white self-end rounded-tr-none' 
                        : 'bg-surface text-text self-start rounded-tl-none border border-border'
                    }`}>
                       {formatChatMessage(msg.content)}
                    </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Message Input Container */}
           <div className="p-3 pt-0 transition-all">
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
                          className="w-full bg-bg/50 rounded-lg py-2 px-4 text-base md:text-sm focus:outline-none border border-border focus:border-brand transition-all font-medium placeholder:text-text-muted/30 shadow-inner"
                          autoComplete="off"
                        />
                     </div>
                     <div className="relative" ref={emojiPickerRef}>
                        <button 
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${showEmojiPicker ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-surface border-border text-text-muted hover:text-brand hover:border-brand/30 shadow-sm'}`}
                          title="Add emoji"
                          aria-label="Toggle emoji picker"
                        >
                          <Smile size={20} strokeWidth={2} />
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
                       className="w-12 h-12 bg-brand hover:bg-brand-dark disabled:opacity-30 rounded-lg flex items-center justify-center shadow-lg shadow-brand/20 transition-all active:scale-95 text-white flex-shrink-0"
                       aria-label="Send message"
                     >
                        <Send size={18} />
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

      <AnimatePresence>
        {showLegal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLegal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-surface rounded-[2.5rem] p-8 overflow-y-auto max-h-[80vh] shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-text uppercase tracking-tight">Community Guidelines</h3>
                <button onClick={() => setShowLegal(false)} className="text-text-muted hover:text-text transition-colors" aria-label="Close guidelines">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">1. Respect Each Other</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                    Harassment, hate speech, or bullying will not be tolerated. We are a place for anonymous interaction, but that doesn't excuse toxicity.
                  </p>
                </section>
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">2. No Explicit Content</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                    Public rooms must remain "Safe for Work". Sharing explicit images or links in public chatrooms is strictly forbidden and results in an instant ban.
                  </p>
                </section>
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">3. No Spam or Advertising</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                    Do not flood rooms with repetitive messages or promote external products/services.
                  </p>
                </section>
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">4. Privacy First</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                    Don't share personal identification (PII) of yourself or others. Our session-based model is designed to keep you anonymous.
                  </p>
                </section>
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand mb-2">5. Automatic Restriction</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                    To maintain order, if your account is reported 5 times, your IP and nickname will be automatically restricted for 30 minutes from all chat activity.
                  </p>
                </section>
              </div>
              <button 
                onClick={() => setShowLegal(false)}
                className="w-full mt-8 py-4 bg-brand text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

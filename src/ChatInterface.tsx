import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageSquare, Globe, User, MoreVertical, 
  Send, ShieldAlert, DoorOpen, Bell, BellOff, RefreshCw,
  Lock, Search, Plus, ChevronDown, Music, Code, Film, Zap,
  Moon, Hash, Shield, ChevronRight, Mars, Venus, X
} from 'lucide-react';
import { socket } from './socket';
import { ChatMessage, Room, Gender } from './types';

// Helper to sanitize message content and strip clickable links/HTML
const formatChatMessage = (content: string) => {
  // We can't easily strip all text that looks like a URL without potentially breaking normal chat,
  // but we can ensure they aren't rendered as links.
  // By default, React renders strings safely, so as long as we don't use 'linkify' or similar libraries,
  // URLs won't be clickable unless we explicitly make them so.
  // However, we can also strip anything that looks like an HTML tag for extra safety.
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
  const [currentRoom, setCurrentRoom] = useState<string>(() => localStorage.getItem('chatbubble_current_room') || 'lobby');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; nickname: string; gender?: Gender; isDND?: boolean; currentRoom?: string }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>(['global']);
  const [peopleSortBy, setPeopleSortBy] = useState<SortOption>('alphabet');
  const [peopleSortOrder, setPeopleSortOrder] = useState<SortOrder>('asc');
  const [inputText, setInputText] = useState('');
  const [isDND, setIsDND] = useState(false);
  const [activePrivateChat, setActivePrivateChat] = useState<string | null>(null);
  const [privateThreads, setPrivateThreads] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('chatbubble_threads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });
  const [unreadThreads, setUnreadThreads] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [globalStatuses, setGlobalStatuses] = useState<Record<string, { isDND?: boolean }>>({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    socket.on('room:message', (msg) => {
      if (msg.roomId === currentRoom) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('private:message', (msg) => {
      const otherId = msg.senderId === user.id ? msg.recipientId! : msg.senderId;
      setPrivateThreads(prev => {
        const updated = {
          ...prev,
          [otherId]: [...(prev[otherId] || []), msg]
        };
        localStorage.setItem('chatbubble_threads', JSON.stringify(updated));
        return updated;
      });
      
      if (activePrivateChat !== otherId && msg.senderId !== user.id) {
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

    // Request initial list/counts explicitly
    socket.emit('join:room', currentRoom);

    return () => {
      socket.off('room:message');
      socket.off('private:message');
      socket.off('users:list');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('rooms:updated' as any);
      socket.off('status:update');
    };
  }, [currentRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activePrivateChat, privateThreads]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setError(null);
    if (activePrivateChat) {
      socket.emit('send:private', { recipientId: activePrivateChat, content: inputText });
    } else {
      socket.emit('send:message', { roomId: currentRoom, content: inputText });
    }
    setInputText('');
  };

  const switchRoom = (roomId: string) => {
    setCurrentRoom(roomId);
    localStorage.setItem('chatbubble_current_room', roomId);
    setActivePrivateChat(null);
    setMessages([]);
    socket.emit('join:room', roomId);
    setMobileSidebarOpen(false);
  };

  const toggleDND = () => {
    const newVal = !isDND;
    setIsDND(newVal);
    socket.emit('toggle:dnd', newVal);
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
  };

  const currentRoomData = rooms.find(r => r.id === currentRoom);
  const currentChatName = activePrivateChat 
    ? onlineUsers.find(u => u.id === activePrivateChat)?.nickname || 
      (privateThreads[activePrivateChat]?.length > 0
        ? (privateThreads[activePrivateChat][0].senderId === activePrivateChat 
            ? privateThreads[activePrivateChat][0].senderName 
            : "Private Chat")
        : "Private Chat")
    : currentRoom === 'lobby' ? 'General Lobby' : (currentRoomData?.name || "The Lobby");

  return (
    <div className="h-screen flex flex-col bg-bg text-text overflow-hidden font-sans">
      
      {/* TOP PRIVACY BAR */}
      <div className="bg-surface py-2 px-4 flex items-center justify-center gap-2 border-b border-border shrink-0">
        <Lock size={12} className="text-brand" />
        <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">
          Your conversations stay private. No personal data stored.
        </span>
      </div>

      {/* MAIN HEADER */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-10 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-40 relative">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 hover:bg-surface-hover rounded-lg text-text-muted"
            aria-label="Toggle Menu"
          >
            <MoreVertical size={20} className={mobileSidebarOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-brand" />
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-text">ChatBubble</h1>
          </div>
        </div>

        {/* Centered Welcome Message - Only show on desktop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex">
          <span className="text-sm font-medium text-text-muted pointer-events-auto">
            Welcome, <span className="text-text font-black">{user.nickname}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          <div className="flex items-center gap-2 md:gap-3">
             <span className="text-[10px] font-black uppercase text-text-muted tracking-widest hidden sm:flex items-center gap-1.5">
               {isDND ? <BellOff size={12} /> : <Bell size={12} />} DND
             </span>
             <button 
               onClick={toggleDND}
               className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isDND ? 'bg-brand' : 'bg-border'}`}
             >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${isDND ? 'left-6' : 'left-1'}`} />
             </button>
          </div>
          <div className="flex items-center">
            <button 
              onClick={onExit}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-surface/50 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-border hover:border-red-500/20"
            >
              <DoorOpen size={14} />
              <span className="hidden xs:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CONTENT */}
      <div className="flex-1 flex overflow-hidden w-full mx-auto md:px-6 md:py-6 gap-6 relative">
        
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
          fixed inset-y-0 left-0 top-16 md:static md:w-72 flex flex-col gap-4 flex-shrink-0 z-40 transition-transform duration-300 ease-in-out
          bg-surface md:bg-transparent p-6 md:p-0 shadow-2xl md:shadow-none
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-[85%] sm:w-72
        `}>
           {/* Sidebar Close button for mobile */}
           <div className="flex items-center justify-between md:hidden mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-brand">Menu</span>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 hover:bg-surface-hover rounded-lg text-text-muted"
              >
                <X size={18} />
              </button>
           </div>
           {/* Navigation Tabs */}
           <div className="flex bg-border/20 p-1 rounded-xl">
              {(['Rooms', 'Messages', 'People'] as Tab[]).map(tab => {
                let count = 0;
                if (tab === 'Messages') count = Object.keys(privateThreads).length;
                if (tab === 'People') count = onlineUsers.length;
                const hasUnread = tab === 'Messages' && unreadThreads.size > 0;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <div className={`px-1.5 py-0.5 rounded-full text-[8px] flex items-center justify-center font-black relative ${
                      activeTab === tab ? 'bg-brand text-white' : 'bg-surface-hover text-text-muted'
                    }`}>
                      {count}
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
                      )}
                    </div>
                    {tab}
                  </button>
                );
              })}
           </div>

           {/* Content List Card */}
           <div className="flex-1 bg-surface rounded-[2rem] border border-border shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                             <span className="text-xs font-bold truncate max-w-[140px] tracking-tight">General Lobby</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <div className={`w-1 h-1 rounded-full ${currentRoom === 'lobby' ? 'bg-brand' : 'bg-slate-300'}`} />
                              <span className="text-[9px] font-black opacity-60 font-mono">
                                {rooms.find(r => r.id === 'lobby')?.userCount || 0}
                              </span>
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
                                        <span className="text-xs font-bold truncate max-w-[140px] tracking-tight text-text">{room.name}</span>
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                        <div className={`w-1 h-1 rounded-full ${currentRoom === room.id ? 'bg-brand' : 'bg-slate-300'}`} />
                                        <span className="text-[9px] font-black opacity-60 font-mono text-text-muted">{room.userCount || 0}</span>
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
                        {onlineUsers
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
                                     <p className="text-xs font-bold tracking-tight text-text">{u.nickname}</p>
                                     {u.isDND && <BellOff size={12} className="text-orange-500 fill-orange-500/10" title="DND Enabled" />}
                                     {blockedUsers.has(u.id) && <Shield size={12} className="text-red-500" title="Restricted" />}
                                   </div>
                                   <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">{u.gender || 'Private'}</p>
                                </div>
                             </button>
                             
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                  onClick={() => blockedUsers.has(u.id) ? handleUnblock(u.id) : handleBlock(u.id)}
                                  className={`p-1.5 rounded-lg transition-colors ${blockedUsers.has(u.id) ? 'bg-red-500/10 text-red-500' : 'bg-surface-hover text-text-muted hover:text-text'}`}
                                  title={blockedUsers.has(u.id) ? "Unrestrict" : "Restrict"}
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
                          </div>
                        ))}
                      </div>
                    </div>
                 )}
                 
                 {activeTab === 'Messages' && Object.keys(privateThreads).map(otherId => {
                    const thread = privateThreads[otherId];
                    const lastMsg = thread[thread.length - 1];
                    const otherUser = onlineUsers.find(u => u.id === otherId);
                    
                    // Fallback to name from the last message sent by them or to them
                    const displayName = otherUser?.nickname || 
                      (lastMsg.senderId === otherId ? lastMsg.senderName : "Chat Partner");

                    return (
                      <div 
                        key={otherId} 
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all group relative ${activePrivateChat === otherId ? 'bg-brand/10 shadow-sm' : 'hover:bg-surface-hover/50'}`}
                      >
                         {unreadThreads.has(otherId) && (
                           <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-full" />
                         )}
                         <button 
                           onClick={() => {
                             setActivePrivateChat(otherId);
                             setMobileSidebarOpen(false);
                           }}
                           className="flex items-center gap-3 flex-1 min-w-0 text-left"
                         >
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-sm ${
                               otherUser?.gender === 'Male' ? 'bg-blue-500 text-white' :
                               otherUser?.gender === 'Female' ? 'bg-pink-500 text-white' :
                               otherUser?.gender === 'Non-binary' ? 'bg-indigo-500 text-white' :
                               'bg-slate-500 text-white'
                             }`}>
                                {otherUser?.gender === 'Male' && <Mars size={16} />}
                                {otherUser?.gender === 'Female' && <Venus size={16} />}
                                {otherUser?.gender === 'Non-binary' && <span>NB</span>}
                                {(otherUser?.gender === 'Prefer not to say' || otherUser?.gender === 'Other' || !otherUser?.gender) && <span>P</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <p className={`text-xs font-bold tracking-tight truncate ${unreadThreads.has(otherId) ? 'text-brand' : 'text-text'}`}>{displayName}</p>
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
                              onClick={() => blockedUsers.has(otherId) ? handleUnblock(otherId) : handleBlock(otherId)}
                              className={`p-1.5 rounded-lg transition-colors ${blockedUsers.has(otherId) ? 'bg-red-500/10 text-red-500' : 'bg-surface-hover text-text-muted hover:text-text'}`}
                              title={blockedUsers.has(otherId) ? "Unrestrict" : "Restrict"}
                            >
                               <Shield size={12} />
                            </button>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </aside>

        {/* CENTER CHAT DISPLAY WINDOW */}
        <main className="flex-1 bg-surface md:rounded-[2.5rem] border-x md:border border-border flex flex-col overflow-hidden relative shadow-sm z-10 w-full">
           {/* Window Header */}
           <div className="p-4 md:p-6 flex items-center gap-4 border-b border-border bg-surface-hover/20">
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center border border-brand/5">
                 <MessageSquare size={24} className="text-brand" />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                   <h2 className="text-lg font-black tracking-tight text-text">{currentChatName}</h2>
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

           {/* Message Buffer Flow */}
           <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-center mb-8">
                 <div className="bg-border/30 px-4 py-1.5 rounded-full text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] border border-border">
                    Welcome to {currentChatName}!
                 </div>
              </div>

              <div className="bg-brand/5 border border-brand/10 p-5 rounded-2xl mb-8 mx-auto max-w-[90%]">
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

               {((activePrivateChat ? (privateThreads[activePrivateChat] || []) : messages) || []).length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 opacity-40 select-none pointer-events-none">
                   <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                     <MessageSquare size={32} className="text-brand" />
                   </div>
                   <p className="text-sm font-black uppercase tracking-widest text-text-muted">No messages yet</p>
                   <p className="text-[10px] font-bold text-text-muted/60">
                     {activePrivateChat ? `Start a private conversation with ${currentChatName}` : 'Say hi to start the conversation!'}
                   </p>
                 </div>
               )}

              {((activePrivateChat ? privateThreads[activePrivateChat] : messages) || []).map((msg, idx) => (
                <div key={msg.id} className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2">
                   <div className={`flex items-center gap-2 ${msg.senderId === user.id ? 'justify-end mr-4' : 'ml-4'}`}>
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{msg.senderName}</span>
                      <span className="text-[8px] text-text-muted/40 font-bold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm transition-all ${
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
           <div className="p-6 pt-0">
              {error && (
                <div className="mb-2 text-center animate-in fade-in slide-in-from-top-2">
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                     {error}
                   </span>
                </div>
              )}
              {activePrivateChat && globalStatuses[activePrivateChat]?.isDND && (
                <div className="mb-2 text-center">
                   <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
                     Recipient has DND enabled
                   </span>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3">
                 <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder={`Message ${currentChatName}...`} 
                      className="w-full bg-bg/50 rounded-xl py-4 px-6 text-sm focus:outline-none border border-border focus:border-brand transition-all font-medium placeholder:text-text-muted/30 shadow-inner"
                    />
                 </div>
                 <button 
                   type="submit"
                   disabled={!inputText.trim()}
                   className="w-14 h-14 bg-brand hover:bg-brand-dark disabled:opacity-30 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 transition-all active:scale-95 text-white flex-shrink-0"
                 >
                    <Send size={20} />
                 </button>
              </form>
           </div>
        </main>
      </div>
    </div>
  );
};

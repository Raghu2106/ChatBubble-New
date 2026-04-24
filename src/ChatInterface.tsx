import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageSquare, Globe, User, MoreVertical, 
  Send, ShieldAlert, DoorOpen, Bell, BellOff, RefreshCw,
  Lock, Search, Plus, ChevronDown, Music, Code, Film, Zap,
  Moon, Hash, Shield, ChevronRight
} from 'lucide-react';
import { socket } from './socket';
import { ChatMessage, Room, Gender } from './types';

interface ChatInterfaceProps {
  user: { nickname: string; id: string; gender?: Gender; interests: string[] };
}

type Tab = 'Rooms' | 'Messages' | 'People';
type SortOption = 'alphabet' | 'gender';
type SortOrder = 'asc' | 'desc';

const CATEGORIES = [
  { id: 'local', name: 'Connect Locally', icon: Globe },
  { id: 'global', name: 'Connect Globally', icon: Globe },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Rooms');
  const [currentRoom, setCurrentRoom] = useState<string>('lobby');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; nickname: string; gender?: Gender; isDND?: boolean }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>(['global']);
  const [peopleSortBy, setPeopleSortBy] = useState<SortOption>('alphabet');
  const [peopleSortOrder, setPeopleSortOrder] = useState<SortOrder>('asc');
  const [inputText, setInputText] = useState('');
  const [isDND, setIsDND] = useState(false);
  const [activePrivateChat, setActivePrivateChat] = useState<string | null>(null);
  const [privateThreads, setPrivateThreads] = useState<Record<string, ChatMessage[]>>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('room:message', (msg) => {
      if (msg.roomId === currentRoom) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('private:message', (msg) => {
      const otherId = msg.senderId === socket.id ? msg.recipientId! : msg.senderId;
      setPrivateThreads(prev => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), msg]
      }));
    });

    socket.on('users:list', (list) => setOnlineUsers(list));
    socket.on('user:joined', (u) => setOnlineUsers(prev => [...prev, u]));
    socket.on('user:left', (uid) => setOnlineUsers(prev => prev.filter(u => u.id !== uid)));
    socket.on('rooms:updated' as any, (updatedRooms: Room[]) => setRooms(updatedRooms));
    socket.on('status:update', ({ userId, isDND }) => {
      setOnlineUsers(prev => prev.map(u => u.id === userId ? { ...u, isDND } : u));
    });

    return () => {
      socket.off('room:message');
      socket.off('private:message');
      socket.off('users:list');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('rooms:updated' as any);
    };
  }, [currentRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activePrivateChat, privateThreads]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activePrivateChat) {
      socket.emit('send:private', { recipientId: activePrivateChat, content: inputText });
    } else {
      socket.emit('send:message', { roomId: currentRoom, content: inputText });
    }
    setInputText('');
  };

  const switchRoom = (roomId: string) => {
    setCurrentRoom(roomId);
    setActivePrivateChat(null);
    setMessages([]);
    socket.emit('join:room', roomId);
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

  const currentRoomData = rooms.find(r => r.id === currentRoom);
  const currentChatName = activePrivateChat 
    ? onlineUsers.find(u => u.id === activePrivateChat)?.nickname || 
      (privateThreads[activePrivateChat]?.length > 0
        ? (privateThreads[activePrivateChat][0].senderId === activePrivateChat 
            ? privateThreads[activePrivateChat][0].senderName 
            : "Private Chat")
        : "Private Chat")
    : currentRoomData?.name || "The Lobby";

  return (
    <div className="h-screen flex flex-col bg-[#1a1625] text-white overflow-hidden font-sans">
      
      {/* TOP PRIVACY BAR */}
      <div className="bg-[#241d33] py-2 px-4 flex items-center justify-center gap-2 border-b border-white/5 shrink-0">
        <Lock size={12} className="text-[#a855f7]" />
        <span className="text-[10px] uppercase font-black tracking-widest text-white/40">
          Your conversations stay private. No personal data stored.
        </span>
      </div>

      {/* MAIN HEADER */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-10 bg-[#1a1625] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white/90">ChatSpace</h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase text-white/30 tracking-widest flex items-center gap-1.5">
               {isDND ? <BellOff size={12} /> : <Bell size={12} />} DND
             </span>
             <button 
               onClick={toggleDND}
               className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isDND ? 'bg-[#9d367c]' : 'bg-white/10'}`}
             >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isDND ? 'left-6' : 'left-1'}`} />
             </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/40">Welcome, <span className="text-white font-black">{user.nickname}</span></span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CONTENT */}
      <div className="flex-1 flex overflow-hidden max-w-6xl w-full mx-auto px-6 py-6 gap-6">
        
        {/* LEFT SIDEBAR CATEGORIES */}
        <aside className="w-72 flex flex-col gap-4 flex-shrink-0">
           {/* Navigation Tabs */}
           <div className="flex bg-white/5 p-1 rounded-xl">
              {(['Rooms', 'Messages', 'People'] as Tab[]).map(tab => {
                let count = 0;
                if (tab === 'Messages') count = Object.keys(privateThreads).length;
                if (tab === 'People') count = onlineUsers.filter(u => u.currentRoom === currentRoom).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    <div className={`px-1.5 py-0.5 rounded-full text-[8px] flex items-center justify-center font-black ${
                      activeTab === tab ? 'bg-[#9d367c] text-white' : 'bg-white/10 text-white/40'
                    }`}>
                      {count}
                    </div>
                    {tab}
                  </button>
                );
              })}
           </div>

           {/* Content List Card */}
           <div className="flex-1 bg-[#241d33]/40 rounded-[2rem] border border-white/5 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                 {activeTab === 'Rooms' && (
                   <div className="space-y-6">
                     {/* THE LOBBY - SPECIAL ITEM */}
                     <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] px-2">The Lobby</span>
                        <button 
                          onClick={() => switchRoom('lobby')}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                            currentRoom === 'lobby' ? 'bg-[#9d367c]/20 text-[#ff8ac8]' : 'hover:bg-white/5 text-white/40'
                          }`}
                        >
                           <div className="flex items-center gap-3">
                             <MessageSquare size={16} className={currentRoom === 'lobby' ? 'text-[#ff8ac8]' : 'opacity-40'} />
                             <span className="text-xs font-bold truncate max-w-[140px] tracking-tight">General Lobby</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <div className={`w-1 h-1 rounded-full ${currentRoom === 'lobby' ? 'bg-[#ff8ac8]' : 'bg-white/20'}`} />
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
                                   className={`text-white/20 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} 
                                 />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7]">{category.name}</span>
                              </div>
                              <Plus size={14} className="text-white/10 group-hover:text-white/40 transition-colors" />
                            </div>
                            
                            {!isCollapsed && (
                              <div className="space-y-1">
                                {filteredRooms.map(room => (
                                  <button 
                                    key={room.id}
                                    onClick={() => switchRoom(room.id)}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                      currentRoom === room.id ? 'bg-[#9d367c]/20 text-[#ff8ac8]' : 'hover:bg-white/5 text-white/40'
                                    }`}
                                  >
                                     <div className="flex items-center gap-3">
                                       <Hash size={16} className={currentRoom === room.id ? 'text-[#ff8ac8]' : 'opacity-40'} />
                                       <span className="text-xs font-bold truncate max-w-[140px] tracking-tight">{room.name}</span>
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                        <div className={`w-1 h-1 rounded-full ${currentRoom === room.id ? 'bg-[#ff8ac8]' : 'bg-white/20'}`} />
                                        <span className="text-[9px] font-black opacity-60 font-mono">{room.userCount || 0}</span>
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
                      <div className="flex items-center justify-between px-2 pb-2 border-b border-white/5">
                        <div className="flex gap-2">
                           <button 
                             onClick={() => setPeopleSortBy('alphabet')}
                             className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded ${peopleSortBy === 'alphabet' ? 'bg-[#9d367c] text-white' : 'bg-white/5 text-white/30'}`}
                           >A-Z</button>
                           <button 
                             onClick={() => setPeopleSortBy('gender')}
                             className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded ${peopleSortBy === 'gender' ? 'bg-[#9d367c] text-white' : 'bg-white/5 text-white/30'}`}
                           >Gender</button>
                        </div>
                        <button 
                          onClick={() => setPeopleSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="text-[8px] font-black uppercase tracking-tighter text-[#a855f7] hover:text-[#ff8ac8]"
                        >
                          {peopleSortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                        </button>
                      </div>

                      <div className="space-y-1">
                        {onlineUsers
                          .filter(u => u.currentRoom === currentRoom && u.id !== socket.id)
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
                          <button 
                            key={u.id} 
                            onClick={() => setActivePrivateChat(u.id)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                          >
                             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-[#ff8ac8]">
                                {u.nickname.charAt(0)}
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold tracking-tight">{u.nickname}</p>
                                  {u.isDND && <BellOff size={10} className="text-[#a855f7]" title="DND Enabled" />}
                                </div>
                                <p className="text-[9px] text-[#a855f7] uppercase font-black tracking-widest">{u.gender || 'Private'}</p>
                             </div>
                          </button>
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
                      <button 
                        key={otherId} 
                        onClick={() => setActivePrivateChat(otherId)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${activePrivateChat === otherId ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      >
                         <div className="w-8 h-8 rounded-lg bg-[#9d367c]/20 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-[#ff8ac8]">
                            {displayName.charAt(0)}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                               <p className="text-xs font-bold tracking-tight truncate">{displayName}</p>
                               <span className="text-[8px] opacity-30">{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[10px] text-white/40 truncate">{lastMsg.content}</p>
                         </div>
                      </button>
                    );
                 })}
              </div>
           </div>
        </aside>

        {/* CENTER CHAT DISPLAY WINDOW */}
        <main className="flex-1 bg-[#241d33]/30 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden relative">
           {/* Window Header */}
           <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-white/[0.02]">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                 <MessageSquare size={24} className="text-[#ff8ac8]" />
              </div>
              <div>
                 <h2 className="text-lg font-black tracking-tight">{currentChatName}</h2>
                 <p className="text-[11px] text-white/40 font-medium">
                    {currentRoomData?.description || "A place for open, respectful conversations"}
                 </p>
              </div>
           </div>

           {/* Message Buffer Flow */}
           <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              <div className="flex justify-center mb-8">
                 <div className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] border border-white/5">
                   Welcome to {currentChatName}!
                 </div>
              </div>

              <div className="bg-[#ff8ac8]/5 border border-[#ff8ac8]/10 p-5 rounded-2xl mb-8 mx-auto max-w-[90%]">
                 <p className="text-[11px] text-[#ff8ac8]/60 text-center leading-relaxed font-medium">
                   Please be respectful. Treat others kindly and keep conversations appropriate. Indecent behavior can be anonymously reported (long press/click user). 
                   <br/><br/>
                   <span className="text-white/80 font-black">RULES:</span> 
                   <br/>
                   1. 5 reports result in an <span className="text-white">IP & Nickname ban for 30 minutes</span>.
                   <br/>
                   2. Enable <span className="text-white">DND</span> (top right) to block incoming private messages.
                 </p>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-col gap-6">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 ml-4">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Wanderer_42</span>
                         <span className="text-[8px] text-white/10 font-bold">13:18</span>
                      </div>
                      <div className="bg-white/5 text-white/90 self-start rounded-2xl rounded-tl-none px-5 py-3 text-sm border border-white/5 font-medium shadow-lg backdrop-blur-sm">
                        Hey everyone! How is it going?
                      </div>
                   </div>
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 ml-4">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">NightOwl</span>
                         <span className="text-[8px] text-white/10 font-bold">13:19</span>
                      </div>
                      <div className="bg-white/5 text-white/90 self-start rounded-2xl rounded-tl-none px-5 py-3 text-sm border border-white/5 font-medium shadow-lg backdrop-blur-sm">
                        Just vibing here, you?
                      </div>
                   </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={msg.id} className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2">
                   <div className={`flex items-center gap-2 ${msg.senderId === socket.id ? 'justify-end mr-4' : 'ml-4'}`}>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{msg.senderName}</span>
                      <span className="text-[8px] text-white/10 font-bold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-lg transition-all ${
                     msg.senderId === socket.id 
                       ? 'bg-[#9d367c] text-white self-end rounded-tr-none' 
                       : 'bg-white/5 text-white/90 self-start rounded-tl-none border border-white/5'
                   }`}>
                     {msg.content}
                   </div>
                </div>
              ))}
           </div>

           {/* Message Input Container */}
           <div className="p-6 pt-0">
              {activePrivateChat && onlineUsers.find(u => u.id === activePrivateChat)?.isDND && (
                <div className="mb-2 text-center">
                   <span className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest bg-[#a855f7]/10 px-3 py-1 rounded-full border border-[#a855f7]/20">
                     Recipient has DND enabled
                   </span>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3">
                 <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Message ${currentChatName}...`} 
                      className="w-full bg-white/5 rounded-xl py-4 px-6 text-sm focus:outline-none border border-white/5 focus:border-[#9d367c]/40 transition-all font-medium placeholder:text-white/20 shadow-inner"
                    />
                 </div>
                 <button 
                   type="submit"
                   disabled={!inputText.trim()}
                   className="w-14 h-14 bg-[#9d367c] hover:bg-[#b03d8b] disabled:opacity-30 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 text-white flex-shrink-0"
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

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageSquare, Globe, User, MoreVertical, 
  Send, ShieldAlert, Ban, DoorOpen, Bell, BellOff, X
} from 'lucide-react';
import { socket } from './socket';
import { ChatMessage, Room, User as UserType, Gender } from './types';

interface ChatInterfaceProps {
  user: { nickname: string; id: string; gender?: Gender };
}

type Tab = 'Rooms' | 'People' | 'Messages';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Rooms');
  const [currentRoom, setCurrentRoom] = useState<string>('lobby');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; nickname: string; gender?: Gender }[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDND, setIsDND] = useState(false);
  const [activePrivateChat, setActivePrivateChat] = useState<string | null>(null); // userId
  const [privateThreads, setPrivateThreads] = useState<Record<string, ChatMessage[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
    
    socket.on('error', (msg) => alert(msg));
    socket.on('ban', (hours) => {
      alert(`You have been banned for ${hours} hours due to multiple reports.`);
      window.location.reload();
    });

    return () => {
      socket.off('room:message');
      socket.off('private:message');
      socket.off('users:list');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('rooms:updated' as any);
      socket.off('error');
      socket.off('ban');
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
    setMessages([]); // Clear for fresh load from server (if server sent history)
    socket.emit('join:room', roomId);
  };

  const startPrivateChat = (targetUser: { id: string; nickname: string }) => {
    setActivePrivateChat(targetUser.id);
    setActiveTab('Messages');
  };

  const reportUser = (userId: string) => {
    if (confirm("Report this user for abuse? 5 unique reports result in a temporary ban.")) {
      socket.emit('report:user', userId);
    }
  };

  const toggleDND = () => {
    const newVal = !isDND;
    setIsDND(newVal);
    socket.emit('toggle:dnd', newVal);
  };

  const currentChatName = activePrivateChat 
    ? onlineUsers.find(u => u.id === activePrivateChat)?.nickname || "Private Chat"
    : rooms.find(r => r.id === currentRoom)?.name || "Lobby";

  return (
    <div className="h-screen flex bg-bg relative font-sans text-text overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      
      {/* LEFT AD (300x600) */}
      <div className="hidden xl:flex w-[300px] h-full items-center justify-center p-4">
        <div className="w-[300px] h-[600px] bg-white/5 border border-border flex items-center justify-center rounded-2xl relative overflow-hidden group">
           <span className="text-text-muted text-xs font-bold tracking-widest rotate-90 whitespace-nowrap opacity-20">ADVERTISEMENT</span>
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-brand/20 rounded-xl" />
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-4 w-32 bg-white/10 rounded" />
           </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed lg:relative w-80 h-full border-r border-border flex flex-col bg-surface shadow-2xl z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                 <MessageSquare size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">ChatBubble</h2>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-text-muted">
              <X size={20} />
           </button>
        </div>
        <div className="px-6">
           <div className="flex bg-bg rounded-xl p-1 mb-6">
              {(['Rooms', 'People', 'Messages'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab ? 'bg-surface text-brand-light shadow-md' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-6">
           {activeTab === 'Rooms' && rooms.map(room => (
             <button
               key={room.id}
               onClick={() => switchRoom(room.id)}
               className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${
                 currentRoom === room.id && !activePrivateChat ? 'bg-brand/10 text-brand-light' : 'hover:bg-white/5'
               }`}
             >
               <div className="flex items-center gap-3 text-left">
                  <div className={`p-2 rounded-lg ${currentRoom === room.id ? 'bg-brand/20' : 'bg-surface-hover'}`}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{room.name}</p>
                    <p className="text-[10px] text-text-muted line-clamp-1">{room.description}</p>
                  </div>
               </div>
               <div className="flex items-center gap-1.5 opacity-60">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold">{room.userCount}</span>
               </div>
             </button>
           ))}

           {activeTab === 'People' && onlineUsers.map(u => (
              <div key={u.id} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    u.gender === 'Male' ? 'bg-blue-500/20 text-blue-400' : 
                    u.gender === 'Female' ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {u.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{u.nickname}</p>
                    <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{u.gender || 'Unknown'}</span>
                  </div>
                </div>
                
                {u.id !== socket.id && (
                  <div className="relative group/menu">
                    <button className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-white/10">
                      <MoreVertical size={18} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 py-2 glass rounded-xl hidden group-hover/menu:block shadow-2xl z-50">
                      <button onClick={() => startPrivateChat(u)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-white/5 flex items-center gap-2">
                        <MessageSquare size={14} /> Start Private Chat
                      </button>
                      <button onClick={() => reportUser(u.id)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-500/10 text-red-400 flex items-center gap-2">
                        <ShieldAlert size={14} /> Report User
                      </button>
                    </div>
                  </div>
                )}
              </div>
           ))}

           {activeTab === 'Messages' && Object.keys(privateThreads).map(otherId => {
             const lastMsg = privateThreads[otherId][privateThreads[otherId].length - 1];
             const otherUser = onlineUsers.find(u => u.id === otherId);
             return (
               <button
                 key={otherId}
                 onClick={() => {
                   setActivePrivateChat(otherId);
                   setActiveTab('Messages');
                 }}
                 className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                   activePrivateChat === otherId ? 'bg-brand/10 text-brand-light' : 'hover:bg-white/5'
                 }`}
               >
                 <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center font-bold">
                    {otherId.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 text-left">
                    <p className="font-bold text-sm">{otherUser?.nickname || 'Inactive User'}</p>
                    <p className="text-[10px] text-text-muted line-clamp-1">{lastMsg.content}</p>
                 </div>
               </button>
             );
           })}
        </div>

        <div className="p-6 bg-surface-hover/50 border-t border-border mt-auto">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center">
                 <User size={18} className="text-brand-light" />
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="font-bold text-sm truncate">{user.nickname}</p>
                 <p className="text-[10px] text-brand-light uppercase font-bold tracking-widest">Active Session</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="p-2 text-text-muted hover:text-red-400 rounded-lg transition-colors"
                title="Leave Session"
              >
                <DoorOpen size={20} />
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative h-full bg-bg shadow-inner">
        
        {/* TOP AD (728x90) */}
        <div className="w-full flex items-center justify-center p-4 bg-surface/50 border-b border-border">
          <div className="w-full max-w-[728px] h-20 bg-white/3 rounded-xl border border-border flex items-center justify-center overflow-hidden relative group">
             <span className="text-text-muted text-[10px] font-bold tracking-[0.2em] opacity-20">TOP BANNER ADS</span>
             <div className="absolute inset-0 flex items-center justify-center gap-8 opacity-40">
                <div className="w-8 h-8 rounded-full bg-brand/20" />
                <div className="h-2 w-32 bg-white/5 rounded" />
                <div className="w-12 h-12 rounded-lg bg-brand-light/10" />
             </div>
          </div>
        </div>

        {/* HEADER */}
        <header className="px-5 lg:px-8 py-4 lg:py-6 border-b border-border flex items-center justify-between bg-surface/30 backdrop-blur-md">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white/5 rounded-lg text-text">
                 <Users size={20} />
              </button>
              <div>
                 <h2 className="text-lg lg:text-2xl font-black tracking-tighter flex items-center gap-2 lg:gap-3">
                    <span className="text-brand-light">#</span> {currentChatName}
                 </h2>
                 {!activePrivateChat && (
                   <p className="hidden md:block text-[10px] lg:text-xs text-text-muted mt-0.5">A place for open, respectful conversations.</p>
                 )}
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={toggleDND}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border ${
                  isDND 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-green-500/10 border-green-500/20 text-green-400'
                }`}
              >
                {isDND ? <BellOff size={12} /> : <Bell size={12} />}
                DND: {isDND ? 'ON' : 'OFF'}
              </button>
           </div>
        </header>

        {/* MESSAGES */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
        >
           {/* Welcome Message */}
           {!activePrivateChat && (
             <div className="bg-brand/5 border border-brand/10 p-6 rounded-3xl mb-8">
                <p className="text-sm font-bold text-brand-light mb-2">Welcome to {currentChatName}!</p>
                <div className="space-y-1 text-xs text-text-muted">
                   <p>• Be respectful to others</p>
                   <p>• Multiples reports will result in automatic bans</p>
                   <p>• Enjoy anonymous real-time conversations</p>
                </div>
             </div>
           )}

           {(activePrivateChat ? (privateThreads[activePrivateChat] || []) : messages).map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 ${msg.senderId === socket.id ? 'flex-row-reverse' : ''}`}
              >
                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                   msg.senderId === socket.id ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-surface-hover text-text'
                 }`}>
                    {msg.senderName.charAt(0).toUpperCase()}
                 </div>
                 <div className={`max-w-[70%] space-y-1 ${msg.senderId === socket.id ? 'items-end' : ''} flex flex-col`}>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                         msg.senderGender === 'Female' ? 'text-pink-400' :
                         msg.senderGender === 'Male' ? 'text-blue-400' : 'text-text-muted'
                       }`}>
                         {msg.senderName}
                       </span>
                       <span className="text-[9px] font-bold text-text-muted/50">
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.senderId === socket.id ? 'chat-bubble-user text-white' : 'chat-bubble-other text-text-muted'
                    }`}>
                       {msg.content}
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* INPUT AREA */}
        <div className="p-8 pt-4">
           <form onSubmit={handleSendMessage} className="bg-surface glass p-2 rounded-2xl flex items-center gap-2 group ring-brand/20 transition-all focus-within:ring-2">
              <input
                type="text"
                placeholder={`Message ${activePrivateChat ? 'privately...' : 'in #' + currentChatName + '...'}`}
                className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:outline-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={500}
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="w-12 h-12 bg-brand hover:bg-brand-light text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-20 shadow-lg shadow-brand/20"
              >
                <Send size={20} />
              </button>
           </form>
           <p className="text-[9px] text-center mt-4 uppercase font-black tracking-[0.3em] text-text-muted/30">Anonymous Messaging Powered by ChatBubble</p>
        </div>
      </main>

      {/* RIGHT AD PANEL (300x600 in Chatroom) */}
      <div className="hidden lg:flex w-80 h-full border-l border-border bg-surface/20 flex-col p-6">
         <div className="mb-4 flex items-center justify-between text-xs font-black uppercase tracking-widest text-text-muted/50">
            <span>Safety System</span>
            <ShieldAlert size={14} />
         </div>
         <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-border">
               <p className="text-[10px] font-bold text-text-muted leading-relaxed">
                  Your session is anonymous. Abuse reports are processed in real-time.
               </p>
            </div>
            
            {/* Vertical Ad in sidebar */}
            <div className="flex-1 h-96 mt-8 rounded-2xl bg-brand-dark/10 border border-brand/10 flex flex-col items-center justify-center p-8 space-y-4 relative overflow-hidden grayscale group hover:grayscale-0 transition-all">
                <span className="absolute top-4 left-4 text-[9px] font-black opacity-20">VERTICAL AD</span>
                <div className="w-16 h-1 w-full bg-white/5 rounded" />
                <div className="w-24 h-24 bg-brand/20 rounded-2xl rotate-12" />
                <div className="h-4 w-32 bg-white/5 rounded" />
                <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
         </div>
      </div>

    </div>
  );
};

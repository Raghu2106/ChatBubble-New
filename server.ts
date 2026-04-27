import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
// Vite is imported dynamically in dev mode
import path from "path";
import { v4 as uuidv4 } from "uuid";
// Types duplicated from src/types.ts for backend consistency without runtime imports
export type Gender = 'Male' | 'Female' | 'Other' | 'Non-binary' | 'Prefer not to say';

export interface User {
  id: string;
  nickname: string;
  gender?: Gender;
  interests: string[];
  ip: string;
  bannedUntil?: number;
  reports: Set<string>;
  blockedUsers: Set<string>;
  isDND: boolean;
  currentRoom?: string;
  lastMessageTime: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderGender?: Gender;
  content: string;
  timestamp: number;
  roomId?: string;
  recipientId?: string;
  type: 'public' | 'private' | 'system';
}

export interface Room {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

export interface ServerToClientEvents {
  'room:message': (message: ChatMessage) => void;
  'private:message': (message: ChatMessage) => void;
  'user:joined': (user: { id: string; nickname: string; gender?: Gender; currentRoom?: string; isDND?: boolean }) => void;
  'user:left': (userId: string) => void;
  'users:list': (users: { id: string; nickname: string; gender?: Gender; currentRoom?: string; isDND?: boolean }[]) => void;
  'error': (msg: string) => void;
  'ban': (durationHours: number) => void;
  'status:update': (data: { userId: string; isDND: boolean }) => void;
  'match:found': (data: { peerId: string; peerNickname: string; peerGender?: Gender }) => void;
  'match:left': () => void;
}

export interface ClientToServerEvents {
  'join:room': (roomId: string) => void;
  'send:message': (data: { roomId: string; content: string }) => void;
  'send:private': (data: { recipientId: string; content: string }) => void;
  'report:user': (userId: string) => void;
  'block:user': (userId: string) => void;
  'unblock:user': (userId: string) => void;
  'toggle:dnd': (isDND: boolean) => void;
  'match:find': () => void;
  'match:cancel': () => void;
  'match:leave': () => void;
}

const PORT = Number(process.env.PORT) || 3000;

// In-memory Stores
const users = new Map<string, User>();
const sessions = new Map<string, string>(); // socketId -> userId
const userTimers = new Map<string, NodeJS.Timeout>();
const rooms: Room[] = [
  { id: 'lobby', name: 'The Lobby', description: 'A place for open, respectful conversations.', userCount: 0 },
  // Indian Cities
  { id: 'mumbai', name: 'Mumbai', description: 'Chat with folks in the City of Dreams.', userCount: 0 },
  { id: 'delhi', name: 'Delhi', description: 'The heart of India. Conversations and chai.', userCount: 0 },
  { id: 'bangalore', name: 'Bangalore', description: 'Silicon Valley of India.', userCount: 0 },
  { id: 'hyderabad', name: 'Hyderabad', description: 'City of Pearls and Biryani.', userCount: 0 },
  { id: 'chennai', name: 'Chennai', description: 'Gateway to South India.', userCount: 0 },
  { id: 'kolkata', name: 'Kolkata', description: 'City of Joy.', userCount: 0 },
  { id: 'pune', name: 'Pune', description: 'The Oxford of the East.', userCount: 0 },
  { id: 'ahmedabad', name: 'Ahmedabad', description: 'Manchester of the East.', userCount: 0 },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', description: 'Capital of Kerala - God\'s Own Country.', userCount: 0 },
  { id: 'lucknow', name: 'Lucknow', description: 'City of Nawabs.', userCount: 0 },
  { id: 'jaipur', name: 'Jaipur', description: 'The Pink City.', userCount: 0 },
  { id: 'chandigarh', name: 'Chandigarh', description: 'The Beautiful City.', userCount: 0 },
  // Global / Asia / GCC
  { id: 'usa', name: 'USA', description: 'Connect with people across the United States.', userCount: 0 },
  { id: 'uk', name: 'United Kingdom', description: 'British vibes and banter.', userCount: 0 },
  { id: 'canada', name: 'Canada', description: 'O Canada! Friendly chats from the Great White North.', userCount: 0 },
  { id: 'australia', name: 'Australia', description: 'G\'day mate! Australian connections.', userCount: 0 },
  { id: 'germany', name: 'Germany', description: 'Chat with folks from Deutschland.', userCount: 0 },
  { id: 'france', name: 'France', description: 'Bonjour! French connections.', userCount: 0 },
  { id: 'uae', name: 'UAE', description: 'Connecting Dubai, Abu Dhabi, and beyond.', userCount: 0 },
  { id: 'saudi', name: 'Saudi Arabia', description: 'Middle East vibes and conversations.', userCount: 0 },
  { id: 'qatar', name: 'Qatar', description: 'Connect with folks in Doha and beyond.', userCount: 0 },
  { id: 'singapore', name: 'Singapore', description: 'The Lion City.', userCount: 0 },
  { id: 'japan', name: 'Japan', description: 'Connect with the Land of the Rising Sun.', userCount: 0 },
  { id: 'south_korea', name: 'South Korea', description: 'Chat with folks in the land of K-culture.', userCount: 0 },
  { id: 'thailand', name: 'Thailand', description: 'Vibrant chats from the Land of Smiles.', userCount: 0 },
  { id: 'philippines', name: 'Philippines', description: 'Connecting across the Pearl of the Orient Seas.', userCount: 0 },
  { id: 'malaysia', name: 'Malaysia', description: 'Truly Asia! Connect with Malaysian vibes.', userCount: 0 },
  { id: 'bahrain', name: 'Bahrain', description: 'Connecting folks in the heart of the Gulf.', userCount: 0 },
];

const bannedIps = new Map<string, number>(); // ip -> unbanTime
const bannedNicknames = new Map<string, number>(); // nickname -> unbanTime
const matchingQueue: string[] = []; // socket IDs

async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
  const app = express();
  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Admin middleware or routes can go here
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  io.on("connection", (socket) => {
    const ip = socket.handshake.address;

    // Check if IP is banned
    const banTime = bannedIps.get(ip);
    if (banTime && banTime > Date.now()) {
      socket.emit('error', 'You are currently banned from this platform.');
      socket.disconnect();
      return;
    }

    socket.on('join:room', (roomId) => {
      // For anonymous entry, we might need a separate 'entry' event
      // but let's assume the client sends user info on first join or entry
    });

    // Handle Entry / Session Init (Not in spec explicitly but needed)
    socket.onAny((event, ...args) => {
      // console.log(`Event: ${event}`, args);
    });

    // Custom entry signal
    socket.on('register' as any, (data: { nickname: string, gender?: any, interests?: string[] }) => {
      const cleanNickname = (data.nickname || '').trim();
      
      if (!cleanNickname) {
        socket.emit('error', 'Nickname cannot be empty.');
        return;
      }

      // Check if nickname is already taken across all active users
      const allUsers = Array.from(users.values());
      const isTaken = allUsers.some(u => 
        (u.nickname || '').trim().toLowerCase() === cleanNickname.toLowerCase()
      );

      if (isTaken) {
        console.log(`Registration failed: Nickname "${cleanNickname}" is already taken.`);
        socket.emit('error', 'This nickname is already in use. Please choose another one.');
        return;
      }

      // Check if socket is already registered
      if (sessions.has(socket.id)) {
        socket.emit('error', 'You are already registered.');
        return;
      }

      // Check if nickname is banned
      const nickBanTime = bannedNicknames.get(data.nickname.toLowerCase());
      if (nickBanTime && nickBanTime > Date.now()) {
        const remaining = Math.ceil((nickBanTime - Date.now()) / 60000);
        socket.emit('error', `This nickname is temporarily banned. Try again in ${remaining} minutes.`);
        return;
      }

      const userId = uuidv4();
      const newUser: User = {
        id: userId,
        nickname: data.nickname,
        gender: data.gender,
        interests: data.interests || [],
        ip: ip,
        reports: new Set(),
        blockedUsers: new Set(),
        isDND: false,
        lastMessageTime: 0
      } as any;

      users.set(userId, newUser);
      sessions.set(socket.id, userId);
      
      socket.emit('registration:success' as any, { userId });
      console.log(`User ${newUser.nickname} registered successfully.`);
    });

    socket.on('join:room', (roomId) => {
      joinRoom(socket, roomId);
    });

    socket.on('send:message', (data) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (!user) return;

      // Rate limit removed by user request
      const now = Date.now();
      const message: ChatMessage = {
        id: uuidv4(),
        senderId: user.id,
        senderName: user.nickname,
        senderGender: user.gender,
        content: data.content.substring(0, 500), // Max length
        timestamp: now,
        roomId: data.roomId,
        type: 'public'
      };

      io.to(data.roomId).emit('room:message', message);
    });

    socket.on('send:private', (data) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (!user) return;

      const recipient = users.get(data.recipientId);
      if (!recipient) {
        console.log(`Private send failed: Recipient ${data.recipientId} not found`);
        socket.emit('error', 'User is no longer online.');
        return;
      }

      if (recipient.isDND) {
        console.log(`Private send failed: Recipient ${recipient.nickname} has DND on`);
        socket.emit('error', 'User has DND enabled.');
        return;
      }

      if (recipient.blockedUsers.has(user.id)) {
        console.log(`Private send blocked by recipient: ${recipient.nickname} blocked ${user.nickname}`);
        // Silent fail as per spec "Silent (no notification to blocked user)"
        return;
      }

      const message: ChatMessage = {
        id: uuidv4(),
        senderId: user.id,
        senderName: user.nickname,
        senderGender: user.gender,
        content: data.content.substring(0, 500),
        timestamp: Date.now(),
        recipientId: data.recipientId,
        type: 'private'
      };

      // Find recipient socket
      const recipientSocketId = Array.from(sessions.entries())
        .find(([sid, uid]) => uid === data.recipientId)?.[0];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('private:message', message);
      }
      // Always send back to sender for their DM UI as long as recipient exists in system
      socket.emit('private:message', message);
    });

    socket.on('toggle:dnd', (isDND) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (user) {
        user.isDND = isDND;
        io.emit('status:update', { userId: user.id, isDND });
      }
    });

    socket.on('report:user', (targetUserId) => {
      const reporterId = sessions.get(socket.id);
      if (!reporterId || reporterId === targetUserId) return;

      const targetUser = users.get(targetUserId);
      if (!targetUser) return;

      // Unique reporters only
      if (!targetUser.reports.has(reporterId)) {
        targetUser.reports.add(reporterId);

        // 5 reports -> 30 minute ban
        if (targetUser.reports.size >= 5) {
          const unbanTime = Date.now() + (30 * 60 * 1000);
          bannedIps.set(targetUser.ip, unbanTime);
          bannedNicknames.set(targetUser.nickname.toLowerCase(), unbanTime);
          
          // Disconnect the banned user
          const bannedSocketId = Array.from(sessions.entries())
            .find(([sid, uid]) => uid === targetUserId)?.[0];
          
          if (bannedSocketId) {
            const bannedSocket = io.sockets.sockets.get(bannedSocketId);
            if (bannedSocket) {
              bannedSocket.emit('ban', 0.5); // 0.5 hours = 30 mins
              bannedSocket.disconnect();
            }
          }
        }
      }
    });

    socket.on('block:user', (targetUserId) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (user) {
        user.blockedUsers.add(targetUserId);
      }
    });

    socket.on('unblock:user', (targetUserId) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (user) {
        user.blockedUsers.delete(targetUserId);
      }
    });

    socket.on('match:find', () => {
      const userId = sessions.get(socket.id);
      if (!userId) return;

      if (matchingQueue.includes(socket.id)) return;

      const user = users.get(userId);
      if (!user) return;

      // Try to find a peer with common interests
      const peerSocketId = matchingQueue.find(sid => {
        const peerUid = sessions.get(sid);
        const peer = users.get(peerUid || '');
        if (!peer) return false;
        
        // Simple overlap check
        const overlap = (user as any).interests?.some((i: string) => (peer as any).interests?.includes(i));
        return overlap || matchingQueue.length > 5; // Match anyway if queue is too long
      });

      if (peerSocketId && io.sockets.sockets.has(peerSocketId)) {
        const idx = matchingQueue.indexOf(peerSocketId);
        if (idx > -1) matchingQueue.splice(idx, 1);

        const peerUserId = sessions.get(peerSocketId);
        const peerUser = users.get(peerUserId || '');

        if (peerUser) {
          socket.emit('match:found', { peerId: peerUser.id, peerNickname: peerUser.nickname, peerGender: peerUser.gender });
          io.to(peerSocketId).emit('match:found', { peerId: user.id, peerNickname: user.nickname, peerGender: user.gender });
        }
      } else {
        matchingQueue.push(socket.id);
      }
    });

    socket.on('match:cancel', () => {
      const idx = matchingQueue.indexOf(socket.id);
      if (idx > -1) matchingQueue.splice(idx, 1);
    });

    socket.on("disconnect", () => {
      const idx = matchingQueue.indexOf(socket.id);
      if (idx > -1) matchingQueue.splice(idx, 1);
      
      const userId = sessions.get(socket.id);
      if (userId) {
        const user = users.get(userId);
        if (user) {
          sessions.delete(socket.id);
          
          // Clear any existing timer for this user
          if (userTimers.has(userId)) {
            clearTimeout(userTimers.get(userId)!);
          }

          // Start a grace period (2h) before final removal
          const timer = setTimeout(() => {
            const finalUser = users.get(userId);
            if (finalUser) {
              // Decrement room counts
              if (finalUser.currentRoom) {
                const roomObj = rooms.find(rm => rm.id === finalUser.currentRoom);
                if (roomObj) {
                  roomObj.userCount = Math.max(0, roomObj.userCount - 1);
                  io.emit('rooms:updated' as any, rooms);
                }
              }
              
              io.emit('user:left', finalUser.id);
              users.delete(userId);
              userTimers.delete(userId);
              console.log(`User ${finalUser.nickname} removed after grace period.`);
            }
          }, 7200000); // 2 hours in ms

          userTimers.set(userId, timer);
          console.log(`User ${user.nickname} disconnected, grace period started.`);
        }
      }
    });

    // Add session resumption event
    socket.on('resume:session' as any, (data: { userId: string }) => {
      const user = users.get(data.userId);
      if (user) {
        // Clear cleanup timer
        if (userTimers.has(data.userId)) {
          clearTimeout(userTimers.get(data.userId)!);
          userTimers.delete(data.userId);
          console.log(`User ${user.nickname} resumed session.`);
        }
        
        // Re-link socket
        sessions.set(socket.id, data.userId);
        socket.emit('registration:success' as any, { userId: user.id });
        
        // If they were in a room, re-join them actually
        if (user.currentRoom) {
          joinRoom(socket, user.currentRoom);
        }
      } else {
        socket.emit('error', 'Session expired. Please join again.');
      }
    });
  });

  function joinRoom(socket: any, roomId: string) {
    const userId = sessions.get(socket.id);
    if (!userId) {
      console.log(`JoinRoom failed: No session for socket ${socket.id}`);
      return;
    }
    const user = users.get(userId);
    if (!user) {
      console.log(`JoinRoom failed: No user for userId ${userId}`);
      return;
    }

    // Leave previous room (using user state instead of socket state to handle resumes)
    const previousRoomId = user.currentRoom;
    if (previousRoomId) {
      socket.leave(previousRoomId);
      const roomObj = rooms.find(rm => rm.id === previousRoomId);
      if (roomObj) {
        roomObj.userCount = Math.max(0, roomObj.userCount - 1);
      }
    }

    socket.join(roomId);
    user.currentRoom = roomId;
    const targetRoom = rooms.find(rm => rm.id === roomId);
    if (targetRoom) targetRoom.userCount++;

    console.log(`User ${user.nickname} joined room ${roomId}. New count: ${targetRoom?.userCount}`);

    // Notify all about room counts immediately to reflect changes accurately
    io.emit('rooms:updated' as any, rooms);

    // Notify others in the room
    socket.to(roomId).emit('user:joined', { 
      id: user.id, 
      nickname: user.nickname, 
      gender: user.gender, 
      currentRoom: user.currentRoom,
      isDND: user.isDND
    });
    
    // Get all members IDs in the room from adapter
    const roomMemberSocketIds = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    
    // Send list of users in room
    const members = roomMemberSocketIds
      .map(sid => {
        const uid = sessions.get(sid);
        const u = users.get(uid || '');
        return u ? { 
          id: u.id, 
          nickname: u.nickname, 
          gender: u.gender, 
          currentRoom: u.currentRoom,
          isDND: u.isDND
        } : null;
      })
      .filter(Boolean);
    
    console.log(`Room ${roomId} members list generated: ${members.length} users`);
    socket.emit('users:list', members as any);
    
    // Notify all about room counts
    io.emit('rooms:updated' as any, rooms);
  }

  // Vite + Express setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`ChatBubble server running on http://localhost:${PORT}`);
  });
}

startServer();

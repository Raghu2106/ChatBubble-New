import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { 
  ChatMessage, 
  Room, 
  User, 
  ClientToServerEvents, 
  ServerToClientEvents 
} from "./src/types.ts";

const PORT = 3000;

// In-memory Stores
const users = new Map<string, User>();
const sessions = new Map<string, string>(); // socketId -> userId
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
  const app = express();
  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" }
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
      
      // Default join lobby
      joinRoom(socket, 'lobby');
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
        socket.emit('error', 'User is no longer online.');
        return;
      }

      if (recipient.isDND) {
        socket.emit('error', 'User has DND enabled.');
        return;
      }

      if (recipient.blockedUsers.has(user.id)) {
        // Silent fail as per spec "Silent (no notification to blocked user)"
        // But usually we don't even send the event. 
        // Here we just return.
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
        // Also send back to sender for their DM UI
        socket.emit('private:message', message);
      }
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
          // Decrement room counts
          io.emit('user:left', user.id);
          // Optional: Clean up user from memory after some time?
          // For now just keep or clean up on socket disconnect
          sessions.delete(socket.id);
          users.delete(userId);
        }
      }
    });
  });

  function joinRoom(socket: any, roomId: string) {
    const userId = sessions.get(socket.id);
    if (!userId) return;
    const user = users.get(userId);
    if (!user) return;

    // Leave previous rooms
    Array.from(socket.rooms).forEach((r: any) => {
      if (r !== socket.id) {
        socket.leave(r);
        const roomObj = rooms.find(rm => rm.id === r);
        if (roomObj) roomObj.userCount = Math.max(0, roomObj.userCount - 1);
      }
    });

    socket.join(roomId);
    user.currentRoom = roomId;
    const targetRoom = rooms.find(rm => rm.id === roomId);
    if (targetRoom) targetRoom.userCount++;

    // Notify others
    socket.to(roomId).emit('user:joined', { 
      id: user.id, 
      nickname: user.nickname, 
      gender: user.gender, 
      currentRoom: user.currentRoom,
      isDND: user.isDND
    });
    
    // Send list of users in room
    const members = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
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
    
    socket.emit('users:list', members as any);
    // Notify all about room counts
    io.emit('rooms:updated' as any, rooms);
  }

  // Vite + Express setup
  if (process.env.NODE_ENV !== "production") {
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

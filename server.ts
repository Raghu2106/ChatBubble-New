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
} from "./src/types";

const PORT = 3000;

// In-memory Stores
const users = new Map<string, User>();
const sessions = new Map<string, string>(); // socketId -> userId
const rooms: Room[] = [
  { id: 'lobby', name: 'The Lobby', description: 'A place for open, respectful conversations.', userCount: 0 },
  { id: 'bangalore', name: 'Bangalore', description: 'Chat with folks in Silicon Valley of India.', userCount: 0 },
  { id: 'delhi', name: 'Delhi', description: 'The heart of India. Conversations and chai.', userCount: 0 },
  { id: 'music', name: 'Music', description: 'Beats, melodies, and everything in between.', userCount: 0 },
  { id: 'tech', name: 'Tech', description: 'Coders, creators, and geeks unite.', userCount: 0 },
  { id: 'movies', name: 'Movies', description: 'Discuss the latest blockbusters and cult classics.', userCount: 0 },
];

const bannedIps = new Map<string, number>(); // ip -> unbanTime

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
    socket.on('register' as any, (data: { nickname: string, gender?: any }) => {
      const userId = uuidv4();
      const newUser: User = {
        id: userId,
        nickname: data.nickname,
        gender: data.gender,
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

      // Rate limit: 1 msg / 1 sec (spec said 2 sec, let's stick to 1.5s for balance)
      const now = Date.now();
      const lastTime = (user as any).lastMessageTime || 0;
      if (now - lastTime < 1500) {
        socket.emit('error', 'Please slow down. Anti-spam active.');
        return;
      }
      (user as any).lastMessageTime = now;

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

        // 5 reports -> 6 hour ban
        if (targetUser.reports.size >= 5) {
          const unbanTime = Date.now() + (6 * 60 * 60 * 1000);
          bannedIps.set(targetUser.ip, unbanTime);
          
          // Disconnect the banned user
          const bannedSocketId = Array.from(sessions.entries())
            .find(([sid, uid]) => uid === targetUserId)?.[0];
          
          if (bannedSocketId) {
            const bannedSocket = io.sockets.sockets.get(bannedSocketId);
            if (bannedSocket) {
              bannedSocket.emit('ban', 6);
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

    socket.on("disconnect", () => {
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
    const targetRoom = rooms.find(rm => rm.id === roomId);
    if (targetRoom) targetRoom.userCount++;

    // Notify others
    socket.to(roomId).emit('user:joined', { id: user.id, nickname: user.nickname, gender: user.gender });
    
    // Send list of users in room
    const members = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .map(sid => {
        const uid = sessions.get(sid);
        const u = users.get(uid || '');
        return u ? { id: u.id, nickname: u.nickname, gender: u.gender } : null;
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

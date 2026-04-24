export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface User {
  id: string;
  nickname: string;
  gender?: Gender;
  ip: string;
  bannedUntil?: number;
  reports: Set<string>; // Set of reporting session IDs
  blockedUsers: Set<string>; // Set of user IDs this user has blocked
  isDND: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderGender?: Gender;
  content: string;
  timestamp: number;
  roomId?: string; // For public rooms
  recipientId?: string; // For private DMs
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
  'user:joined': (user: { id: string; nickname: string; gender?: Gender }) => void;
  'user:left': (userId: string) => void;
  'users:list': (users: { id: string; nickname: string; gender?: Gender }[]) => void;
  'error': (msg: string) => void;
  'ban': (durationHours: number) => void;
  'status:update': (data: { userId: string; isDND: boolean }) => void;
}

export interface ClientToServerEvents {
  'join:room': (roomId: string) => void;
  'send:message': (data: { roomId: string; content: string }) => void;
  'send:private': (data: { recipientId: string; content: string }) => void;
  'report:user': (userId: string) => void;
  'block:user': (userId: string) => void;
  'toggle:dnd': (isDND: boolean) => void;
}

export interface SessionData {
  id: string;
  nickname: string;
  gender?: Gender;
}

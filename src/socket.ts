import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "./types";

// Connect to the same host as the window
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  autoConnect: false
});

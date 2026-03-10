import Peer, { DataConnection } from "peerjs";

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

interface PeerChatEvents {
  onMessage?: (message: ChatMessage) => void;
  onConnection?: (peerId: string) => void;
  onDisconnection?: () => void;
  onError?: (error: string) => void;
}

const PEER_PREFIX = "quickchat-";

export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

let peerInstance: Peer | null = null;
let connections: DataConnection[] = [];
let eventHandlers: PeerChatEvents = {};

const generateMessageId = () =>
  Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const setupConnection = (conn: DataConnection) => {
  connections.push(conn);

  conn.on("open", () => {
    eventHandlers.onConnection?.(conn.peer);
  });

  conn.on("data", (data) => {
    const msg = data as ChatMessage;
    eventHandlers.onMessage?.(msg);
  });

  conn.on("close", () => {
    connections = connections.filter((c) => c !== conn);
    eventHandlers.onDisconnection?.();
  });

  conn.on("error", (err) => {
    eventHandlers.onError?.(err.message);
  });
};

export const createRoom = (
  roomCode: string,
  handlers: PeerChatEvents
): Promise<void> => {
  return new Promise((resolve, reject) => {
    eventHandlers = handlers;
    const peerId = PEER_PREFIX + roomCode;

    peerInstance = new Peer(peerId);

    peerInstance.on("open", () => {
      resolve();
    });

    peerInstance.on("connection", (conn) => {
      setupConnection(conn);
    });

    peerInstance.on("error", (err) => {
      if (err.type === "unavailable-id") {
        reject(new Error("Room code already in use. Try another."));
      } else {
        reject(new Error(err.message));
      }
    });
  });
};

export const joinRoom = (
  roomCode: string,
  handlers: PeerChatEvents
): Promise<void> => {
  return new Promise((resolve, reject) => {
    eventHandlers = handlers;
    const targetPeerId = PEER_PREFIX + roomCode;

    peerInstance = new Peer();

    peerInstance.on("open", () => {
      const conn = peerInstance!.connect(targetPeerId, { reliable: true });

      conn.on("open", () => {
        setupConnection(conn);
        resolve();
      });

      conn.on("error", (err) => {
        reject(new Error("Could not connect to room: " + err.message));
      });

      // Timeout if connection doesn't open
      setTimeout(() => {
        if (conn.open === false) {
          reject(new Error("Room not found or host is offline"));
        }
      }, 10000);
    });

    peerInstance.on("error", (err) => {
      reject(new Error(err.message));
    });
  });
};

export const sendMessage = (text: string, sender: string): ChatMessage => {
  const message: ChatMessage = {
    id: generateMessageId(),
    text,
    sender,
    timestamp: Date.now(),
  };

  connections.forEach((conn) => {
    if (conn.open) {
      conn.send(message);
    }
  });

  return message;
};

export const disconnect = () => {
  connections.forEach((conn) => conn.close());
  connections = [];
  peerInstance?.destroy();
  peerInstance = null;
  eventHandlers = {};
};

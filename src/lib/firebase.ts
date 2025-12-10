import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAooasycmB64_D_UwaXa3QyGtT510ZRle8",
  authDomain: "chatapp-d19d0.firebaseapp.com",
  databaseURL: "https://chatapp-d19d0-default-rtdb.firebaseio.com",
  projectId: "chatapp-d19d0",
  storageBucket: "chatapp-d19d0.firebasestorage.app",
  messagingSenderId: "62482689774",
  appId: "1:62482689774:web:2edcb2c882d934e9c38dff"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createRoom = async (roomCode: string, username: string) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  await set(roomRef, {
    createdAt: Date.now(),
    users: { [username]: true }
  });
  return roomCode;
};

export const checkRoomExists = async (roomCode: string): Promise<boolean> => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
};

export const joinRoom = async (roomCode: string, username: string) => {
  const userRef = ref(database, `rooms/${roomCode}/users/${username}`);
  await set(userRef, true);
};

export const sendMessage = async (roomCode: string, message: string, sender: string) => {
  const messagesRef = ref(database, `rooms/${roomCode}/messages`);
  await push(messagesRef, {
    text: message,
    sender,
    timestamp: Date.now()
  });
};

export const subscribeToMessages = (roomCode: string, callback: (messages: Message[]) => void) => {
  const messagesRef = ref(database, `rooms/${roomCode}/messages`);
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages: Message[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
        id,
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp
      }));
      messages.sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    } else {
      callback([]);
    }
  });
};

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

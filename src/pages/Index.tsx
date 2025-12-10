import { useState } from "react";
import RoomEntry from "@/components/RoomEntry";
import ChatRoom from "@/components/ChatRoom";

const Index = () => {
  const [roomData, setRoomData] = useState<{
    roomCode: string;
    username: string;
    isCreator: boolean;
  } | null>(null);

  const handleJoinRoom = (roomCode: string, username: string, isCreator: boolean) => {
    setRoomData({ roomCode, username, isCreator });
  };

  const handleLeave = () => {
    setRoomData(null);
  };

  if (roomData) {
    return (
      <ChatRoom
        roomCode={roomData.roomCode}
        username={roomData.username}
        onLeave={handleLeave}
      />
    );
  }

  return <RoomEntry onJoinRoom={handleJoinRoom} />;
};

export default Index;

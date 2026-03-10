import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, ArrowRight, Sparkles } from "lucide-react";
import { generateRoomCode } from "@/lib/peer-chat";
import { toast } from "sonner";

interface RoomEntryProps {
  onJoinRoom: (roomCode: string, username: string, isCreator: boolean) => void;
}

const RoomEntry = ({ onJoinRoom }: RoomEntryProps) => {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");

  const handleCreate = () => {
    if (!username.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const code = generateRoomCode();
    onJoinRoom(code, username.trim(), true);
  };

  const handleJoin = () => {
    if (!username.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length < 6) {
      toast.error("Please enter a valid 6-character room code");
      return;
    }
    onJoinRoom(roomCode.toUpperCase().trim(), username.trim(), false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-strong mb-4 gradient-border">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">QuickChat</h1>
          <p className="text-muted-foreground">Connect instantly with a room code</p>
        </div>

        {/* Main Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {mode === "choice" && (
            <div className="space-y-4">
              <Button
                onClick={() => setMode("create")}
                className="w-full h-14 text-lg font-display bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Room
              </Button>
              <Button
                onClick={() => setMode("join")}
                variant="secondary"
                className="w-full h-14 text-lg font-display glass border-border/50 hover:bg-secondary/80"
              >
                <Users className="w-5 h-5 mr-2" />
                Join Room
              </Button>
            </div>
          )}

          {mode === "create" && (
            <div className="space-y-6">
              <button
                onClick={() => setMode("choice")}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                ← Back
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 glass border-border/50 focus:border-primary"
                    maxLength={20}
                  />
                </div>
                
                <Button
                  onClick={handleCreate}
                  className="w-full h-12 text-lg font-display bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Create & Get Code
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-6">
              <button
                onClick={() => setMode("choice")}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                ← Back
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 glass border-border/50 focus:border-primary"
                    maxLength={20}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Room Code</label>
                  <Input
                    placeholder="Enter 6-character code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="h-12 glass border-border/50 focus:border-primary font-mono text-center text-xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <Button
                  onClick={handleJoin}
                  className="w-full h-12 text-lg font-display bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Join Room
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground/60 text-sm mt-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          No account needed • Peer-to-peer • Free forever
        </p>
      </div>
    </div>
  );
};

export default RoomEntry;

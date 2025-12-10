import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, ArrowRight, Sparkles } from "lucide-react";
import { generateRoomCode, createRoom, checkRoomExists, joinRoom } from "@/lib/firebase";
import { toast } from "sonner";

interface RoomEntryProps {
  onJoinRoom: (roomCode: string, username: string, isCreator: boolean) => void;
}

const RoomEntry = ({ onJoinRoom }: RoomEntryProps) => {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!username.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setIsLoading(true);
    try {
      const code = generateRoomCode();
      await createRoom(code, username.trim());
      onJoinRoom(code, username.trim(), true);
      toast.success(`Room ${code} created!`);
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!username.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    setIsLoading(true);
    try {
      const exists = await checkRoomExists(roomCode.toUpperCase());
      if (!exists) {
        toast.error("Room not found");
        return;
      }
      await joinRoom(roomCode.toUpperCase(), username.trim());
      onJoinRoom(roomCode.toUpperCase(), username.trim(), false);
      toast.success("Joined room!");
    } catch (error) {
      toast.error("Failed to join room");
    } finally {
      setIsLoading(false);
    }
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
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-display bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLoading ? "Creating..." : "Create & Get Code"}
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
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-display bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLoading ? "Joining..." : "Join Room"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground/60 text-sm mt-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          No account needed • End-to-end simple
        </p>
      </div>
    </div>
  );
};

export default RoomEntry;

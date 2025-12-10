import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Copy, LogOut, Check } from "lucide-react";
import { sendMessage, subscribeToMessages, Message } from "@/lib/firebase";
import { toast } from "sonner";

interface ChatRoomProps {
  roomCode: string;
  username: string;
  onLeave: () => void;
}

const ChatRoom = ({ roomCode, username, onLeave }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(roomCode, setMessages);
    return () => unsubscribe();
  }, [roomCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await sendMessage(roomCode, newMessage.trim(), username);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-semibold text-lg">QuickChat</h1>
            <p className="text-xs text-muted-foreground">Welcome, {username}</p>
          </div>
        </div>
        
        <button
          onClick={copyRoomCode}
          className="flex items-center gap-2 glass px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors group"
        >
          <span className="font-mono text-sm tracking-wider text-primary">{roomCode}</span>
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center mb-4 gradient-border">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground/60">
              Share the code <span className="text-primary font-mono">{roomCode}</span> with someone to start chatting
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isOwn = message.sender === username;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-slide-up`}
            >
              <div className={`message-bubble ${isOwn ? "message-sent" : "message-received"}`}>
                {!isOwn && (
                  <p className="text-xs text-primary font-medium mb-1">{message.sender}</p>
                )}
                <p className="break-words">{message.text}</p>
                <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-strong border-t border-border/50 p-4 sticky bottom-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 h-12 glass border-border/50 focus:border-primary"
            maxLength={500}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

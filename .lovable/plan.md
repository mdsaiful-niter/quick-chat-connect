

# PeerJS Chat App — Build Plan

## Approach
Replace Firebase with PeerJS for free, serverless peer-to-peer chat. The app will use PeerJS's free public signaling server to establish WebRTC connections between two users.

## How It Works
1. **Creator** generates a 6-character room code, which becomes their PeerJS peer ID
2. **Joiner** enters the code and connects directly to the creator's browser
3. Messages flow directly between browsers via WebRTC data channels — no server stores anything

## Limitations
- Both users must be online simultaneously
- No message history after closing the browser
- Room dies when the creator leaves

## File Changes

1. **Remove `firebase` dependency** from package.json, add `peerjs`

2. **Delete `src/lib/firebase.ts`** — no longer needed

3. **Create `src/lib/peer-chat.ts`** — PeerJS wrapper with:
   - `createRoom(code)` — creates a Peer with the room code as ID, listens for connections
   - `joinRoom(code)` — connects to the peer with that code
   - `sendMessage(conn, text, sender)` — sends data over the connection
   - `onMessage(callback)` — registers message handler
   - `disconnect()` — cleanup

4. **Update `src/components/RoomEntry.tsx`** — remove Firebase imports, use peer-chat functions

5. **Update `src/components/ChatRoom.tsx`** — use PeerJS connection for sending/receiving messages instead of Firebase subscriptions

6. **Update `public/chat.html`** — standalone version using PeerJS CDN instead of Firebase


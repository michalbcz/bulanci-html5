# Multiplayer Guide for Bulánci HTML5

## Overview
Bulánci now supports real-time online multiplayer for 2-4 players using WebRTC technology. No server setup required - just share a link!

## How to Play Online

### Starting a Game (Host)
1. Open the game at https://michalbcz.github.io/bulanci-html5/
2. Click the **"Multiplayer"** button on the main menu
3. A unique room will be created automatically
4. **Copy the URL** from your browser's address bar (it will look like: `https://.../#room-ABC123`)
5. **Share this link** with your friends (via Discord, WhatsApp, email, etc.)
6. Wait for players to join (you'll see them appear in the lobby)
7. Once everyone has joined, click **"Ready"**
8. When all players are ready, a countdown will start: 3... 2... 1... GO!

### Joining a Game (Guest)
1. **Click the link** shared by the host
2. You'll automatically connect to the game lobby
3. Wait for all players to join
4. Click **"Ready"** when you're prepared to start
5. Wait for the countdown, then play!

## Controls
- **Player 1-4**: Use either WASD + Spacebar OR Arrow Keys + Enter
- **Movement**: WASD or Arrow keys
- **Shoot**: Spacebar or Enter

## Technical Details

### Technology Stack
- **WebRTC**: Peer-to-peer data connections (no game server needed!)
- **PeerJS**: Public signaling service (hosted by PeerJS community)
- **Hosting**: GitHub Pages + jsDelivr CDN
- **Synchronization**: Game state synced every 50ms

### How It Works
1. **Room Creation**: When you start multiplayer, a unique room ID is generated
2. **Signaling**: PeerJS cloud service helps players find each other
3. **Connection**: Once connected, players communicate directly (peer-to-peer)
4. **Synchronization**: Each player sends their position and actions to all other players
5. **No Server**: All game logic runs in your browser - no game server required!

### Architecture
```
Player 1 (Host) ←→ PeerJS Cloud (signaling only)
     ↕                    ↕
Direct P2P          Direct P2P
     ↕                    ↕
Player 2 ←→ Player 3 ←→ Player 4
```

### Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection
- Hosted via HTTP/HTTPS (not `file://`)

## Troubleshooting

### "Connection Failed" Error
- Check your internet connection
- Make sure you're accessing via HTTPS
- Try refreshing the page and creating a new room
- Check if your firewall is blocking WebRTC

### Players Can't Connect
- Verify the shared link is complete (includes `#room-...`)
- Make sure all players are on the same room link
- Some corporate networks block WebRTC - try a different network

### Lag or Desync
- Check your internet connection speed
- Close other bandwidth-heavy applications
- Reduce the number of players (4 players need more bandwidth than 2)

### PeerJS Server Down
The game uses the public PeerJS cloud service. If it's experiencing issues:
- Wait a few minutes and try again
- Check PeerJS status at https://peerjs.com

## Privacy & Security
- **No data collection**: The game doesn't collect or store any personal data
- **Peer-to-peer**: Game data is only shared between players, not stored on servers
- **Temporary**: Room IDs are temporary and expire after all players disconnect
- **Local execution**: All game logic runs in your browser

## Limitations
- Maximum 4 players per game
- Requires stable internet connection
- Game host leaving will disconnect all players
- No game replay or recording features

## Advanced: Self-Hosting PeerJS Server
If you want to host your own PeerJS signaling server:

1. Install PeerJS Server:
```bash
npm install -g peer
```

2. Run the server:
```bash
peerjs --port 9000 --key peerjs --path /myapp
```

3. Update `MultiplayerManager.js`:
```javascript
this.peer = new Peer(this.roomId, {
    host: 'your-server.com',
    port: 9000,
    path: '/myapp',
    secure: true
});
```

## Credits
- Original game: Michal Vlček
- Multiplayer implementation: Added via WebRTC/PeerJS
- PeerJS: https://peerjs.com

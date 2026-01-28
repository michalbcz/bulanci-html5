/**
 * Multiplayer Manager using WebRTC (PeerJS)
 * Handles peer connections, room management, and game state synchronization
 *
 * @class MultiplayerManager
 * @constructor
 * @author GitHub Copilot
 */
BULANCI.MultiplayerManager = function(game) {
    this.game = game;
    this.peer = null;
    this.connections = {}; // Map of peerId -> connection
    this.roomId = null;
    this.playerId = null; // 1-4
    this.isHost = false;
    this.players = {}; // Map of playerId -> {peerId, ready, connection}
    this.myPeerId = null;
    this.readyPlayers = new Set();
    this.gameStarted = false;
    
    // State synchronization
    this.lastSyncTime = 0;
    this.syncInterval = 50; // ms - 20 updates/sec for responsive multiplayer
    this.syncIntervalId = null; // Store interval ID for cleanup
    this.countdownIntervalId = null; // Store countdown interval ID
    this.countdownStarted = false; // Prevent duplicate countdowns
    
    // PeerJS configuration (shared between createRoom and joinRoom)
    this.peerConfig = {
        host: '0.peerjs.com',
        secure: true,
        port: 443,
        path: '/',
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    };
}

/**
 * Initialize the multiplayer system
 */
BULANCI.MultiplayerManager.prototype.init = function() {
    // Check if PeerJS is available
    if (typeof Peer === 'undefined') {
        this.showError('PeerJS library not loaded. Multiplayer requires internet connection.');
        console.error('PeerJS not found. Make sure the CDN is accessible.');
        return;
    }
    
    // Check if we have a room ID in the URL hash
    var hash = window.location.hash.substring(1);
    
    if (hash && hash.startsWith('room-')) {
        // Join existing room
        this.roomId = hash;
        this.isHost = false;
        this.joinRoom(this.roomId);
    } else {
        // Create new room
        this.createRoom();
    }
}

/**
 * Create a new room
 */
BULANCI.MultiplayerManager.prototype.createRoom = function() {
    var self = this;
    
    // Generate a unique room ID
    this.roomId = 'room-' + this.generateRoomId();
    this.isHost = true;
    this.playerId = 1;
    
    // Create peer with room ID using shared config
    this.peer = new Peer(this.roomId, this.peerConfig);
    
    this.peer.on('open', function(id) {
        self.myPeerId = id;
        console.log('Room created with ID:', id);
        
        // Get local avatar if available
        var localAvatar = null;
        if (window.avatarManager) {
            localAvatar = window.avatarManager.getAvatar();
        }
        
        // Update URL with room ID
        window.location.hash = self.roomId;
        
        // Register ourselves as player 1
        self.players[1] = {
            peerId: self.myPeerId,
            ready: false,
            connection: null,
            isMe: true,
            avatar: localAvatar
        };
        
        self.updateLobbyUI();
    });
    
    // Listen for incoming connections
    this.peer.on('connection', function(conn) {
        self.handleIncomingConnection(conn);
    });
    
    this.peer.on('error', function(err) {
        console.error('Peer error:', err);
        self.showError('Connection error: ' + err.type);
    });
}

/**
 * Join an existing room
 */
BULANCI.MultiplayerManager.prototype.joinRoom = function(roomId) {
    var self = this;
    
    // Create peer with random ID
    var myId = 'player-' + Math.random().toString(36).substring(7);
    
    this.peer = new Peer(myId, this.peerConfig);
    
    this.peer.on('open', function(id) {
        self.myPeerId = id;
        console.log('My peer ID:', id);
        
        // Connect to host
        var conn = self.peer.connect(roomId);
        
        conn.on('open', function() {
            console.log('Connected to host');
            
            // Get local avatar if available
            var localAvatar = null;
            if (window.avatarManager) {
                localAvatar = window.avatarManager.getAvatar();
            }
            
            // Send join request
            conn.send({
                type: 'join',
                peerId: self.myPeerId,
                avatar: localAvatar
            });
        });
        
        conn.on('data', function(data) {
            self.handleMessage(data, conn);
        });
        
        conn.on('close', function() {
            console.log('Connection to host closed');
            self.handlePlayerDisconnect(roomId);
        });
        
        conn.on('error', function(err) {
            console.error('Connection error:', err);
            self.showError('Failed to connect to room');
        });
        
        // Store connection
        self.connections[roomId] = conn;
    });
    
    // Listen for incoming connections from other players
    this.peer.on('connection', function(conn) {
        self.handleIncomingConnection(conn);
    });
    
    this.peer.on('error', function(err) {
        console.error('Peer error:', err);
        self.showError('Connection error: ' + err.type);
    });
}

/**
 * Handle incoming peer connection
 */
BULANCI.MultiplayerManager.prototype.handleIncomingConnection = function(conn) {
    var self = this;
    
    conn.on('data', function(data) {
        self.handleMessage(data, conn);
    });
    
    conn.on('close', function() {
        console.log('Peer disconnected:', conn.peer);
        self.handlePlayerDisconnect(conn.peer);
    });
    
    // Store connection
    this.connections[conn.peer] = conn;
}

/**
 * Handle messages from peers
 */
BULANCI.MultiplayerManager.prototype.handleMessage = function(data, conn) {
    var self = this;
    
    switch(data.type) {
        case 'join':
            // Host assigns player ID
            if (this.isHost) {
                var newPlayerId = this.getNextPlayerId();
                if (newPlayerId) {
                    this.players[newPlayerId] = {
                        peerId: data.peerId,
                        ready: false,
                        connection: conn,
                        isMe: false,
                        avatar: data.avatar || null
                    };
                    
                    // Send assignment to joining player
                    conn.send({
                        type: 'assigned',
                        playerId: newPlayerId,
                        players: this.getPlayerList()
                    });
                    
                    // Broadcast to all other players
                    this.broadcast({
                        type: 'playerJoined',
                        playerId: newPlayerId,
                        peerId: data.peerId,
                        avatar: data.avatar || null
                    }, data.peerId);
                    
                    // Connect new player to all existing players
                    for (var pid in this.players) {
                        if (pid != newPlayerId && pid != 1 && this.players[pid].peerId !== this.myPeerId) {
                            conn.send({
                                type: 'connectTo',
                                peerId: this.players[pid].peerId,
                                playerId: pid
                            });
                        }
                    }
                    
                    this.updateLobbyUI();
                } else {
                    // Room full
                    conn.send({
                        type: 'error',
                        message: 'Room is full (max 4 players)'
                    });
                    conn.close();
                }
            }
            break;
            
        case 'assigned':
            // We got our player ID assignment
            this.playerId = data.playerId;
            this.players = {};
            
            // Rebuild players list
            for (var i = 0; i < data.players.length; i++) {
                var p = data.players[i];
                this.players[p.playerId] = {
                    peerId: p.peerId,
                    ready: p.ready,
                    connection: p.playerId === 1 ? conn : null,
                    isMe: p.playerId === this.playerId,
                    avatar: p.avatar || null
                };
            }
            
            this.updateLobbyUI();
            break;
            
        case 'playerJoined':
            // Another player joined
            this.players[data.playerId] = {
                peerId: data.peerId,
                ready: false,
                connection: null,
                isMe: false,
                avatar: data.avatar || null
            };
            this.updateLobbyUI();
            break;
            
        case 'connectTo':
            // Host told us to connect to another peer
            if (!this.connections[data.peerId]) {
                var conn2 = this.peer.connect(data.peerId);
                conn2.on('open', function() {
                    console.log('Connected to peer:', data.peerId);
                });
                conn2.on('data', function(d) {
                    self.handleMessage(d, conn2);
                });
                this.connections[data.peerId] = conn2;
                
                if (this.players[data.playerId]) {
                    this.players[data.playerId].connection = conn2;
                }
            }
            break;
            
        case 'ready':
            // Player marked as ready - validate playerId
            if (data.playerId && this.players[data.playerId]) {
                this.players[data.playerId].ready = true;
                this.readyPlayers.add(data.playerId);
            }
            
            // If host, broadcast to all
            if (this.isHost) {
                this.broadcast({
                    type: 'ready',
                    playerId: data.playerId
                }, data.peerId);
            }
            
            this.updateLobbyUI();
            
            // Check if all players are ready (prevent race condition)
            if (this.isHost && this.allPlayersReady() && !this.countdownStarted) {
                this.startCountdown();
            }
            break;
            
        case 'startCountdown':
            // Host initiated countdown
            this.startCountdown();
            break;
            
        case 'startGame':
            // Start the game
            this.startMultiplayerGame();
            break;
            
        case 'gameState':
            // Receive game state update
            this.handleGameStateUpdate(data.state);
            break;
            
        case 'playerAction':
            // Receive player action (move, shoot)
            this.handlePlayerAction(data);
            break;
            
        case 'avatarUpdate':
            // Receive avatar update from peer
            if (data.playerId && this.players[data.playerId]) {
                this.players[data.playerId].avatar = data.avatar;
                
                // Update in-game player avatar if game is running
                if (this.game && this.game.players && this.game.players[data.playerId - 1]) {
                    this.game.players[data.playerId - 1].setAvatar(data.avatar);
                }
            }
            break;
            
        case 'playerDisconnected':
            this.handlePlayerDisconnect(data.peerId);
            break;
            
        case 'error':
            this.showError(data.message);
            break;
    }
}

/**
 * Get next available player ID
 */
BULANCI.MultiplayerManager.prototype.getNextPlayerId = function() {
    for (var i = 1; i <= 4; i++) {
        if (!this.players[i]) {
            return i;
        }
    }
    return null;
}

/**
 * Get list of players for syncing
 */
BULANCI.MultiplayerManager.prototype.getPlayerList = function() {
    var list = [];
    for (var pid in this.players) {
        list.push({
            playerId: parseInt(pid),
            peerId: this.players[pid].peerId,
            ready: this.players[pid].ready,
            avatar: this.players[pid].avatar || null
        });
    }
    return list;
}

/**
 * Broadcast message to all connected peers
 */
BULANCI.MultiplayerManager.prototype.broadcast = function(data, excludePeerId) {
    for (var peerId in this.connections) {
        if (peerId !== excludePeerId && this.connections[peerId]) {
            try {
                this.connections[peerId].send(data);
            } catch(e) {
                console.error('Error sending to peer:', peerId, e);
            }
        }
    }
}

/**
 * Broadcast avatar update to all peers
 */
BULANCI.MultiplayerManager.prototype.broadcastAvatarUpdate = function(avatarData) {
    if (this.playerId) {
        // Update local player avatar
        if (this.players[this.playerId]) {
            this.players[this.playerId].avatar = avatarData;
        }
        
        // Broadcast to all peers
        this.broadcast({
            type: 'avatarUpdate',
            playerId: this.playerId,
            avatar: avatarData
        });
        
        // Update in-game player avatar if game is running
        if (this.game && this.game.players && this.game.players[this.playerId - 1]) {
            this.game.players[this.playerId - 1].setAvatar(avatarData);
        }
    }
}

/**
 * Mark local player as ready
 */
BULANCI.MultiplayerManager.prototype.markReady = function() {
    if (this.players[this.playerId]) {
        this.players[this.playerId].ready = true;
        this.readyPlayers.add(this.playerId);
        
        // Notify all peers
        this.broadcast({
            type: 'ready',
            playerId: this.playerId,
            peerId: this.myPeerId
        });
        
        this.updateLobbyUI();
        
        // If host and all ready, start countdown (check for race condition)
        if (this.isHost && this.allPlayersReady() && !this.countdownStarted) {
            this.startCountdown();
        }
    }
}

/**
 * Check if all players are ready
 */
BULANCI.MultiplayerManager.prototype.allPlayersReady = function() {
    var playerCount = Object.keys(this.players).length;
    if (playerCount < 2) return false; // Need at least 2 players
    
    for (var pid in this.players) {
        if (!this.players[pid].ready) {
            return false;
        }
    }
    return true;
}

/**
 * Start countdown before game
 */
BULANCI.MultiplayerManager.prototype.startCountdown = function() {
    var self = this;
    
    // Prevent duplicate countdowns
    if (this.countdownStarted) {
        return;
    }
    this.countdownStarted = true;
    
    // Notify all players to start countdown
    if (this.isHost) {
        this.broadcast({
            type: 'startCountdown'
        });
    }
    
    var countdown = 3;
    this.countdownIntervalId = setInterval(function() {
        self.updateCountdownUI(countdown);
        countdown--;
        
        if (countdown < 0) {
            clearInterval(self.countdownIntervalId);
            self.countdownIntervalId = null;
            
            // Start game
            if (self.isHost) {
                self.broadcast({
                    type: 'startGame'
                });
            }
            self.startMultiplayerGame();
        }
    }, 1000);
}

/**
 * Start the multiplayer game
 */
BULANCI.MultiplayerManager.prototype.startMultiplayerGame = function() {
    this.gameStarted = true;
    
    // Hide lobby UI, start game
    this.hideLobbyUI();
    
    // Initialize game for number of players
    var playerCount = Object.keys(this.players).length;
    this.game.startMultiplayer(playerCount, this.playerId);
    
    // Apply avatars to players
    for (var pid in this.players) {
        var playerIndex = parseInt(pid) - 1;
        if (this.game.players[playerIndex] && this.players[pid].avatar) {
            this.game.players[playerIndex].setAvatar(this.players[pid].avatar);
        }
    }
    
    // Start syncing game state
    this.startGameSync();
}

/**
 * Start game state synchronization
 */
BULANCI.MultiplayerManager.prototype.startGameSync = function() {
    var self = this;
    
    // Clear any existing sync interval
    if (this.syncIntervalId) {
        clearInterval(this.syncIntervalId);
    }
    
    this.syncIntervalId = setInterval(function() {
        if (self.gameStarted && self.game.status === 1) {
            // Send our player state to all peers
            var myPlayer = self.game.players[self.playerId - 1];
            if (myPlayer) {
                self.broadcast({
                    type: 'playerAction',
                    playerId: self.playerId,
                    x: myPlayer.x,
                    y: myPlayer.y,
                    direction: myPlayer.direction,
                    shooting: myPlayer.shooting,
                    shoots: myPlayer.shoots.map(function(s) {
                        return {
                            x: s.x,
                            y: s.y,
                            direction: s.direction,
                            isActive: s.isActive
                        };
                    })
                });
            }
        }
    }, this.syncInterval);
}

/**
 * Handle player action update
 */
BULANCI.MultiplayerManager.prototype.handlePlayerAction = function(data) {
    // Validate data
    if (!data || !data.playerId || data.playerId === this.playerId) {
        return;
    }
    
    // Validate position data (prevent malicious values)
    if (typeof data.x !== 'number' || typeof data.y !== 'number' ||
        data.x < 0 || data.x > this.game.width ||
        data.y < 0 || data.y > this.game.height) {
        console.warn('Invalid player position data received');
        return;
    }
    
    if (this.game.status === 1) {
        var playerIndex = data.playerId - 1;
        if (this.game.players[playerIndex]) {
            var player = this.game.players[playerIndex];
            
            // Update position
            player.x = data.x;
            player.y = data.y;
            player.direction = data.direction || 1;
            
            // Sync shoots (with validation)
            if (data.shoots && Array.isArray(data.shoots)) {
                player.shoots = data.shoots.filter(function(s) {
                    return s && typeof s.x === 'number' && typeof s.y === 'number';
                }).map(function(s) {
                    var shoot = new BULANCI.Shoot();
                    shoot.x = s.x;
                    shoot.y = s.y;
                    shoot.direction = s.direction || 1;
                    shoot.isActive = s.isActive !== false;
                    return shoot;
                });
            }
        }
    }
}

/**
 * Handle player disconnect
 */
BULANCI.MultiplayerManager.prototype.handlePlayerDisconnect = function(peerId) {
    // Find and remove player
    for (var pid in this.players) {
        if (this.players[pid].peerId === peerId) {
            delete this.players[pid];
            this.readyPlayers.delete(parseInt(pid));
            break;
        }
    }
    
    // Notify others if host
    if (this.isHost) {
        this.broadcast({
            type: 'playerDisconnected',
            peerId: peerId
        });
    }
    
    this.updateLobbyUI();
    
    // If in game, handle disconnect
    if (this.gameStarted) {
        this.showError('A player disconnected');
    }
}

/**
 * Generate random room ID using crypto API if available
 */
BULANCI.MultiplayerManager.prototype.generateRoomId = function() {
    // Try to use crypto API for better randomness
    if (window.crypto && window.crypto.getRandomValues) {
        var array = new Uint8Array(4);
        window.crypto.getRandomValues(array);
        return Array.from(array, function(byte) {
            return ('0' + byte.toString(36)).slice(-2);
        }).join('').substring(0, 6).toUpperCase();
    }
    // Fallback to Math.random()
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Update lobby UI
 */
BULANCI.MultiplayerManager.prototype.updateLobbyUI = function() {
    var lobbyDiv = document.getElementById('multiplayer-lobby');
    if (!lobbyDiv) return;
    
    var html = '<div class="lobby-content">';
    html += '<h2>Multiplayer Lobby</h2>';
    
    // Room info
    if (this.isHost) {
        html += '<div class="room-info">';
        html += '<p>Share this link to invite players:</p>';
        html += '<input type="text" readonly value="' + window.location.href + '" id="room-link" />';
        html += '<button onclick="copyRoomLink()">Copy Link</button>';
        html += '</div>';
    }
    
    // Player list
    html += '<div class="player-list">';
    html += '<h3>Players (' + Object.keys(this.players).length + '/4):</h3>';
    html += '<ul>';
    
    for (var i = 1; i <= 4; i++) {
        if (this.players[i]) {
            var status = this.players[i].ready ? '✓ Ready' : 'Not Ready';
            var isMe = this.players[i].isMe ? ' (You)' : '';
            html += '<li class="player-' + i + '">Player ' + i + isMe + ' - ' + status + '</li>';
        } else {
            html += '<li class="empty-slot">Empty Slot</li>';
        }
    }
    
    html += '</ul>';
    html += '</div>';
    
    // Ready button
    if (this.playerId && !this.players[this.playerId].ready) {
        html += '<button id="ready-btn" class="ready-button">Ready</button>';
    } else if (this.playerId && this.players[this.playerId].ready) {
        html += '<p class="ready-status">Waiting for other players...</p>';
    }
    
    html += '</div>';
    
    lobbyDiv.innerHTML = html;
    lobbyDiv.style.display = 'block';
    
    // Attach event listener
    var readyBtn = document.getElementById('ready-btn');
    if (readyBtn) {
        var self = this;
        readyBtn.onclick = function() {
            self.markReady();
        };
    }
}

/**
 * Update countdown UI
 */
BULANCI.MultiplayerManager.prototype.updateCountdownUI = function(count) {
    var lobbyDiv = document.getElementById('multiplayer-lobby');
    if (lobbyDiv) {
        var countdownHtml = '<div class="countdown">';
        countdownHtml += '<h1>' + (count > 0 ? count : 'GO!') + '</h1>';
        countdownHtml += '</div>';
        lobbyDiv.innerHTML = countdownHtml;
    }
}

/**
 * Hide lobby UI
 */
BULANCI.MultiplayerManager.prototype.hideLobbyUI = function() {
    var lobbyDiv = document.getElementById('multiplayer-lobby');
    if (lobbyDiv) {
        lobbyDiv.style.display = 'none';
    }
}

/**
 * Cleanup multiplayer resources
 */
BULANCI.MultiplayerManager.prototype.cleanup = function() {
    // Clear intervals
    if (this.syncIntervalId) {
        clearInterval(this.syncIntervalId);
        this.syncIntervalId = null;
    }
    if (this.countdownIntervalId) {
        clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
    }
    
    // Close all connections
    for (var peerId in this.connections) {
        if (this.connections[peerId]) {
            this.connections[peerId].close();
        }
    }
    this.connections = {};
    
    // Destroy peer
    if (this.peer) {
        this.peer.destroy();
        this.peer = null;
    }
    
    // Reset state
    this.gameStarted = false;
    this.countdownStarted = false;
    this.players = {};
    this.readyPlayers.clear();
}

/**
 * Show error message
 */
BULANCI.MultiplayerManager.prototype.showError = function(message) {
    alert('Multiplayer Error: ' + message);
}

/**
 * Copy room link to clipboard
 */
function copyRoomLink() {
    var linkInput = document.getElementById('room-link');
    if (linkInput) {
        var linkText = linkInput.value;
        
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(linkText).then(function() {
                showCopySuccess();
            }).catch(function(err) {
                // Fallback to older method
                fallbackCopyToClipboard(linkInput);
            });
        } else {
            // Fallback to older method
            fallbackCopyToClipboard(linkInput);
        }
    }
}

/**
 * Fallback clipboard copy method
 */
function fallbackCopyToClipboard(input) {
    input.select();
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy link. Please copy manually.');
    }
}

/**
 * Show copy success message
 */
function showCopySuccess() {
    var button = event.target;
    var originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = 'rgba(40, 167, 69, 1)';
    setTimeout(function() {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

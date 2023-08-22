const { v4: uuidv4 } = require('uuid');

class PlayerSession {
    constructor(player, serverSession) {
        this.player = player; // Instance of the Player class
        this.serverSession = serverSession;
    
        this.joinTime = Date.now(); // Timestamp for when the session started
        this.spawnTime = null; // Timestamp for when the player spawned in

        this.active = true;
        this.sessionToken = uuidv4(); // Unique session token
    }

    onSpawn() {
        this.spawnTime = Date.now();
    }
}

module.exports = PlayerSession;
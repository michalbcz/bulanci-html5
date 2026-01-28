/**
 * Weapon class for different weapon types
 *
 * @class Weapon
 * @constructor
 * @author GitHub Copilot
 */
BULANCI.Weapon = function(type) {
    this.type = type || 'normal';
    
    // Define weapon properties based on type
    switch(this.type) {
        case 'normal':
            this.speed = 25;
            this.fireRate = 400; // milliseconds between shots
            this.bulletColor = '#ffd649';
            this.name = 'Normal';
            break;
        case 'rapid':
            this.speed = 20;
            this.fireRate = 200; // faster fire rate
            this.bulletColor = '#ff6b6b';
            this.name = 'Rapid Fire';
            break;
        case 'sniper':
            this.speed = 35;
            this.fireRate = 800; // slower but faster bullets
            this.bulletColor = '#4ecdc4';
            this.name = 'Sniper';
            break;
        case 'shotgun':
            this.speed = 15;
            this.fireRate = 600;
            this.bulletColor = '#ffa502';
            this.name = 'Shotgun';
            this.bulletCount = 3; // fires multiple bullets
            break;
        default:
            // Default to normal weapon
            this.speed = 25;
            this.fireRate = 400;
            this.bulletColor = '#ffd649';
            this.name = 'Normal';
            break;
    }
}

BULANCI.Weapon.prototype.getSpeed = function() {
    return this.speed;
}

BULANCI.Weapon.prototype.getFireRate = function() {
    return this.fireRate;
}

BULANCI.Weapon.prototype.getBulletColor = function() {
    return this.bulletColor;
}

BULANCI.Weapon.prototype.getBulletCount = function() {
    return this.bulletCount || 1;
}

BULANCI.Weapon.prototype.getName = function() {
    return this.name;
}

/**
 * Shoot of player
 * @class Shoot
 * @constructor
 * @author Michal Vlcek <mychalvlcek@gmail.com>
 */
BULANCI.Shoot = function(x, y, obstacles) {
    BULANCI.Shoot._superClass.constructor.call(this);

    this.x = x;
    this.y = y;
    this.direction;
    this.xDirection = 0;
    this.yDirection = 0;

    this.width = 14;
    this.height = 10;

    this.isActive = true;
    this.updateTimer;
    this.nearMissTargets = {};

    this.speed = 2;
    
    this.obstacles = obstacles || []; // obstacles that block bullets

    //this.bullets = []; // for more sophisticated weapons, Bullet class?

    this.updateTimer = setInterval(this.updateShoot.bind(this), 1000/30);
}
inherits(BULANCI.Shoot, BULANCI.GameObject);

BULANCI.Shoot.prototype.launch = function(pSpeed, pDirection) {
    this.speed = pSpeed;
    this.direction = pDirection;
    switch (this.direction) {
        case 1:
            this.xDirection = -1;
            this.x -= 12;
            this.y += 34;
            break;
        case 3:
            this.xDirection = 1;
            this.x += 58;
            this.y += 34;
            break;
        case 2:
            this.yDirection = -1;
            var oldWidth = this.width;
            this.width = this.height;
            this.height = oldWidth;

            this.x += 22;
            this.y -= 14;
            break;
        case 4:
            this.yDirection = 1;
            var oldWidth = this.width;
            this.width = this.height;
            this.height = oldWidth;

            this.x += 22;
            this.y += 58;
            break;
    }

}

BULANCI.Shoot.prototype.updateShoot = function() {
    this.x += this.xDirection * this.speed;
    this.y += this.yDirection * this.speed;
    if(this.x < 0 || this.y < 0 || this.x > canvas.width || this.y > canvas.height) {
        this.isActive = false;
    }
    // Check collision with obstacles
    if(this.hasCollisionWithObstacles()) {
        this.isActive = false;
    }
}

/**
 * Check if bullet collides with any obstacle
 */
BULANCI.Shoot.prototype.hasCollisionWithObstacles = function() {
    for(var i = 0; i < this.obstacles.length; i++) {
        var r = this.obstacles[i];
        // AABB collision detection
        if (!(this.x + this.width < r.x || r.x + r.width < this.x || 
              this.y + this.height < r.y || r.y + r.height < this.y)) {
            return true;
        }
    }
    return false;
}

BULANCI.Shoot.prototype.draw = function(context) {
    var centerX = this.x + this.width / 2;
    var centerY = this.y + this.height / 2;

    context.save();
    context.fillStyle = 'rgba(0,0,0,0.12)';
    context.beginPath();
    context.ellipse(centerX + 1, centerY + 7, this.width / 2.2, this.height / 2.6, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#b79a33';
    context.beginPath();
    context.ellipse(centerX, centerY, this.width / 2.1, this.height / 2.2, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#d0b24d';
    context.beginPath();
    context.ellipse(centerX - 2, centerY - 1, this.width / 3.6, this.height / 3.6, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = 'rgba(82, 58, 18, 0.9)';
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(centerX, centerY, this.width / 2.1, this.height / 2.2, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
}

BULANCI.Shoot.prototype.setIsActive = function(isActive) {
    this.isActive = isActive;
}

BULANCI.Shoot.prototype.getIsActive = function() {
    return this.isActive;
}

BULANCI.Shoot.prototype.hasNearMissForTarget = function(targetId) {
    return this.nearMissTargets[targetId] === true;
}

BULANCI.Shoot.prototype.markNearMissForTarget = function(targetId) {
    this.nearMissTargets[targetId] = true;
}

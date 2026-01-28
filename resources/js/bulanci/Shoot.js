/**
 * Shoot of player
 * @class Shoot
 * @constructor
 * @author Michal Vlcek <mychalvlcek@gmail.com>
 */
BULANCI.Shoot = function(x, y, color) {
    BULANCI.Shoot._superClass.constructor.call(this);

    this.x = x;
    this.y = y;
    this.direction;
    this.xDirection = 0;
    this.yDirection = 0;

    this.width = 10;
    this.height = 4;

    this.isActive = true;
    this.updateTimer;

    this.speed = 2;
    this.lifetime = 0; // Track how long bullet has been alive
    this.maxLifetime = 180; // Max frames (6 seconds at 30fps)
    this.color = color || '#ffd649'; // default yellow
    this.spreadOffset = 0; // for shotgun spread

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
            this.x -= 10;
            this.y += 43 + this.spreadOffset;
            break;
        case 3:
            this.xDirection = 1;
            this.x += 55;
            this.y += 22 + this.spreadOffset;
            break;
        case 2:
            this.yDirection = -1;
            var oldWidth = this.width;
            this.width = this.height;
            this.height = oldWidth;

            this.x += 18 + this.spreadOffset;
            this.y -= 10;
            break;
        case 4:
            this.yDirection = 1;
            var oldWidth = this.width;
            this.width = this.height;
            this.height = oldWidth;

            this.x += 34 + this.spreadOffset;
            this.y += 60;
            break;
    }

}

BULANCI.Shoot.prototype.updateShoot = function() {
    this.x += this.xDirection * this.speed;
    this.y += this.yDirection * this.speed;
    this.lifetime++;
    
    // Deactivate bullet after max lifetime
    if(this.lifetime > this.maxLifetime) {
        this.isActive = false;
        return;
    }
    
    // Wrap bullets around screen edges instead of destroying them
    if(this.x < 0) {
        this.x = canvas.width;
    } else if(this.x > canvas.width) {
        this.x = 0;
    }
    
    if(this.y < 0) {
        this.y = canvas.height;
    } else if(this.y > canvas.height) {
        this.y = 0;
    }
}

BULANCI.Shoot.prototype.draw = function(context) {
    //bullet
    context.fillStyle = this.color;
    context.fillRect(this.x,this.y,this.width,this.height);
    context.beginPath();
    context.lineWidth='0.8';
    context.strokeStyle= 'rgba(0,0,0,0.8)';
    context.rect(this.x,this.y,this.width,this.height);
    context.stroke();
    // shadow
    context.fillStyle = 'rgba(0,0,0,0.1)';
    context.fillRect(this.x,this.y+6,this.width,this.height);
}

BULANCI.Shoot.prototype.setIsActive = function(isActive) {
    this.isActive = isActive;
}

BULANCI.Shoot.prototype.getIsActive = function() {
    return this.isActive;
}
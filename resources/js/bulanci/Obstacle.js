/**
 * Obstacle on map
 *
 * @class Obstacle
 * @constructor
 * @author GitHub Copilot
 */
BULANCI.Obstacle = function(x, y, width, height) {
    BULANCI.Obstacle._superClass.constructor.call(this);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = 'rgba(139, 69, 19, 0.8)'; // Brown color for obstacles
}
inherits(BULANCI.Obstacle, BULANCI.GameObject);

BULANCI.Obstacle.prototype.draw = function(context) {
    // Draw obstacle with 3D effect
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
    
    // Add border
    context.strokeStyle = 'rgba(101, 50, 15, 1)';
    context.lineWidth = 2;
    context.strokeRect(this.x, this.y, this.width, this.height);
    
    // Add highlight for 3D effect
    context.fillStyle = 'rgba(160, 82, 45, 0.5)';
    context.fillRect(this.x + 2, this.y + 2, this.width - 4, 5);
}

BULANCI.Obstacle.prototype.uniform = function(xRatio, yRatio) {
    this.x = this.x * xRatio;
    this.y = this.y * yRatio;
    this.width = this.width * xRatio;
    this.height = this.height * yRatio;
}

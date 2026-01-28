/**
 * Desert Map
 * @class DesertMap
 * @constructor
 * @author Map Extension
 */
BULANCI.DesertMap = function() {
    this.name = 'Desert';
    this.obstacles = [];
}

BULANCI.DesertMap.prototype.draw = function(context, images) {
    // Desert gradient background
    var grd = context.createLinearGradient(0, 0, _canvas.width, _canvas.height);
    grd.addColorStop(0, '#EDC9AF'); // Sand color
    grd.addColorStop(1, '#C19A6B'); // Darker sand
    context.fillStyle = grd;
    context.fillRect(0, 0, _canvas.width, _canvas.height);
    
    // Add some dunes/decorations
    context.fillStyle = '#D2B48C';
    context.beginPath();
    context.ellipse(_canvas.width * 0.2, _canvas.height * 0.8, 200, 50, 0, 0, Math.PI * 2);
    context.fill();
    
    context.beginPath();
    context.ellipse(_canvas.width * 0.7, _canvas.height * 0.3, 150, 40, 0, 0, Math.PI * 2);
    context.fill();
}
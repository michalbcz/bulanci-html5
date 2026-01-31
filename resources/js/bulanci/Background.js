/**
* Constructs Background object
* @class Background
* @constructor
* @author Michal Vlcek <mychalvlcek@gmail.com>
*/
BULANCI.Background = function(mapRegistry) {
    this.mapRegistry = mapRegistry;
}
        
BULANCI.Background.prototype.draw = function(context, images, width, height) {
    var currentMap = this.mapRegistry.getCurrentMap();
    
    if (currentMap.type === 'gradient') {
        this.drawGradient(context, currentMap.gradient, width, height);
    } else if (currentMap.type === 'image') {
        context.drawImage(images[currentMap.image], 0, 0, width, height);
    } else {
        // fallback to default grass image
        context.drawImage(images['grass.jpg'], 0, 0, 2551, 1417);
    }
};

BULANCI.Background.prototype.drawGradient = function(context, gradientConfig, width, height) {
    var gradient;
    
    if (gradientConfig.type === 'linear') {
        gradient = context.createLinearGradient(0, 0, 0, height);
    } else if (gradientConfig.type === 'radial') {
        var centerX = width / 2;
        var centerY = height / 2;
        var radius = Math.max(width, height) / 2;
        gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    }
    
    // Add color stops
    var colors = gradientConfig.colors;
    for (var i = 0; i < colors.length; i++) {
        gradient.addColorStop(i / (colors.length - 1), colors[i]);
    }
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
};
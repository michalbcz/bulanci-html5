/**
* Constructs Background object
* @class Background
* @constructor
* @author Michal Vlcek <mychalvlcek@gmail.com>
*/
BULANCI.Background = function() {
}
        
BULANCI.Background.prototype.draw = function(context, images) {
    var gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
    gradient.addColorStop(0, '#d3cfbf');
    gradient.addColorStop(1, '#5b6456');
    context.fillStyle = gradient;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

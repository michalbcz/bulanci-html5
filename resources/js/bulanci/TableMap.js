/**
 * Retro public toilet map viewed from above.
 *
 * @class TableMap
 * @constructor
 */
BULANCI.TableMap = function(width, height) {
    this.width = width || 1024;
    this.height = height || 768;
    this.obstacles = [];
    this.buildLayout(this.width, this.height);
};

BULANCI.TableMap.prototype.buildLayout = function(width, height) {
    this.width = width;
    this.height = height;
    this.obstacles = [];

    var scale = Math.max(0.58, Math.min(width / 1040, height / 760, 1));
    var stallWidth = 114 * scale;
    var stallHeight = 124 * scale;
    var stallGap = 26 * scale;
    var stallStartX = width / 2 - (stallWidth * 3 + stallGap * 2) / 2;
    var stallY = 34 * scale;

    this.obstacles.push({
        x: 52 * scale,
        y: 170 * scale,
        width: 118 * scale,
        height: 214 * scale,
        type: 'sinkBlock'
    });

    this.obstacles.push({
        x: width - 164 * scale,
        y: 166 * scale,
        width: 108 * scale,
        height: 206 * scale,
        type: 'urinalBlock'
    });

    this.obstacles.push({
        x: Math.max(88 * scale, width / 2 - 138 * scale),
        y: height - 112 * scale,
        width: 276 * scale,
        height: 52 * scale,
        type: 'radiator'
    });

    this.obstacles.push({
        x: 190 * scale,
        y: height - 174 * scale,
        width: 78 * scale,
        height: 78 * scale,
        type: 'bucket'
    });

    this.obstacles.push({
        x: width - 258 * scale,
        y: height - 198 * scale,
        width: 142 * scale,
        height: 100 * scale,
        type: 'pipeRack'
    });

    this.obstacles.push({
        x: width / 2 - 54 * scale,
        y: height / 2 - 46 * scale,
        width: 108 * scale,
        height: 92 * scale,
        type: 'maintenanceCart'
    });

    for (var i = 0; i < 3; i++) {
        this.obstacles.push({
            x: stallStartX + i * (stallWidth + stallGap),
            y: stallY,
            width: stallWidth,
            height: stallHeight,
            type: 'stallDoor',
            label: i + 1
        });
    }
};

BULANCI.TableMap.prototype.resize = function(width, height) {
    this.buildLayout(width, height);
};

BULANCI.TableMap.prototype.getObstacles = function() {
    return this.obstacles;
};

BULANCI.TableMap.prototype.draw = function(context) {
    var canvas = context.canvas;

    this.drawFloor(context, canvas.width, canvas.height);
    this.drawPerimeter(context, canvas.width, canvas.height);
    this.drawAmbientLights(context, canvas.width, canvas.height);
    this.drawFloorDetails(context, canvas.width, canvas.height);

    for (var i = 0; i < this.obstacles.length; i++) {
        this.drawObstacle(context, this.obstacles[i]);
    }

    this.drawAtmosphere(context, canvas.width, canvas.height);
};

BULANCI.TableMap.prototype.drawFloor = function(context, width, height) {
    var tileSize = Math.max(42, Math.round(Math.min(width, height) / 14));
    var grout = 'rgba(87, 90, 82, 0.28)';
    var baseGradient = context.createLinearGradient(0, 0, width, height);

    baseGradient.addColorStop(0, '#7a8174');
    baseGradient.addColorStop(1, '#5f665c');

    context.fillStyle = baseGradient;
    context.fillRect(0, 0, width, height);

    for (var y = 0; y <= height; y += tileSize) {
        for (var x = 0; x <= width; x += tileSize) {
            context.fillStyle = ((x / tileSize + y / tileSize) % 2 === 0) ? '#747d72' : '#687166';
            context.fillRect(x, y, tileSize, tileSize);
            context.strokeStyle = grout;
            context.lineWidth = 1;
            context.strokeRect(x, y, tileSize, tileSize);
        }
    }
};

BULANCI.TableMap.prototype.drawPerimeter = function(context, width, height) {
    var wallThickness = Math.max(22, Math.round(Math.min(width, height) / 34));

    context.fillStyle = '#4f4432';
    context.fillRect(0, 0, width, wallThickness);
    context.fillRect(0, height - wallThickness, width, wallThickness);
    context.fillRect(0, 0, wallThickness, height);
    context.fillRect(width - wallThickness, 0, wallThickness, height);

    context.strokeStyle = 'rgba(209, 191, 150, 0.16)';
    context.lineWidth = 2;
    context.strokeRect(wallThickness - 1, wallThickness - 1, width - wallThickness * 2 + 2, height - wallThickness * 2 + 2);
};

BULANCI.TableMap.prototype.drawAmbientLights = function(context, width, height) {
    var panels = [
        { x: width * 0.27, y: height * 0.16, w: width * 0.16, h: height * 0.05 },
        { x: width * 0.73, y: height * 0.16, w: width * 0.16, h: height * 0.05 }
    ];

    for (var i = 0; i < panels.length; i++) {
        context.fillStyle = 'rgba(255, 244, 201, 0.18)';
        context.fillRect(panels[i].x - panels[i].w / 2, panels[i].y - panels[i].h / 2, panels[i].w, panels[i].h);
        context.strokeStyle = 'rgba(237, 224, 177, 0.18)';
        context.lineWidth = 2;
        context.strokeRect(panels[i].x - panels[i].w / 2, panels[i].y - panels[i].h / 2, panels[i].w, panels[i].h);
    }
};

BULANCI.TableMap.prototype.drawFloorDetails = function(context, width, height) {
    this.drawFloorDrain(context, width * 0.5, height * 0.69);
    this.drawFloorDrain(context, width * 0.68, height * 0.32);
    this.drawFloorDrain(context, width * 0.22, height * 0.58);
    this.drawGraffiti(context, width * 0.3, height * 0.8, Math.max(0.8, Math.min(width / 1040, height / 760, 1)));
};

BULANCI.TableMap.prototype.drawObstacle = function(context, obstacle) {
    switch (obstacle.type) {
        case 'stallDoor':
            this.drawStall(context, obstacle);
            break;
        case 'sinkBlock':
            this.drawSinkBlock(context, obstacle);
            break;
        case 'urinalBlock':
            this.drawUrinalBlock(context, obstacle);
            break;
        case 'radiator':
            this.drawRadiator(context, obstacle);
            break;
        case 'bucket':
            this.drawBucket(context, obstacle);
            break;
        case 'pipeRack':
            this.drawPipeRack(context, obstacle);
            break;
        case 'maintenanceCart':
            this.drawMaintenanceCart(context, obstacle);
            break;
    }
};

BULANCI.TableMap.prototype.drawStall = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;
    var wall = Math.max(8, w * 0.08);

    context.fillStyle = '#5f513e';
    context.fillRect(x, y, w, h);

    context.fillStyle = '#786953';
    context.fillRect(x + wall, y + wall, w - wall * 2, h - wall * 2);

    context.fillStyle = '#676f62';
    context.fillRect(x + wall * 1.6, y + wall * 1.6, w - wall * 3.2, h - wall * 3.2);

    context.fillStyle = '#efede4';
    context.beginPath();
    context.ellipse(x + w / 2, y + h * 0.42, w * 0.17, h * 0.16, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.ellipse(x + w / 2, y + h * 0.42, w * 0.1, h * 0.09, 0, 0, Math.PI * 2);
    context.fillStyle = '#a7b0a7';
    context.fill();

    context.fillStyle = '#d4c8a4';
    context.fillRect(x + w * 0.18, y + h - wall - 10, w * 0.64, 10);
    context.fillRect(x + w * 0.68, y + h * 0.68, 10, h * 0.15);

    context.strokeStyle = '#453928';
    context.lineWidth = 3;
    context.strokeRect(x, y, w, h);

    context.fillStyle = 'rgba(37, 30, 22, 0.35)';
    context.fillRect(x + w * 0.14, y + h - wall - 12, w * 0.72, 6);

    context.fillStyle = '#d8ceb1';
    context.font = 'bold 14px "Helvetica"';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(obstacle.label, x + w / 2, y + 16);
};

BULANCI.TableMap.prototype.drawSinkBlock = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;

    context.fillStyle = '#a99a7b';
    context.fillRect(x, y, w, h);

    context.fillStyle = '#d5d8d2';
    context.fillRect(x + 12, y + 12, w - 24, h - 24);

    this.drawSink(context, x + w * 0.18, y + h * 0.18, w * 0.26, h * 0.24);
    this.drawSink(context, x + w * 0.56, y + h * 0.18, w * 0.26, h * 0.24);
    this.drawSink(context, x + w * 0.18, y + h * 0.58, w * 0.26, h * 0.24);
    this.drawSink(context, x + w * 0.56, y + h * 0.58, w * 0.26, h * 0.24);

    context.strokeStyle = '#72654c';
    context.lineWidth = 3;
    context.strokeRect(x, y, w, h);
};

BULANCI.TableMap.prototype.drawSink = function(context, x, y, w, h) {
    context.fillStyle = '#f3f4ef';
    context.beginPath();
    context.roundRect(x, y, w, h, 6);
    context.fill();

    context.strokeStyle = '#9ba39a';
    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = '#87958f';
    context.fillRect(x + w * 0.36, y - 5, w * 0.28, 5);

    context.beginPath();
    context.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.12, 0, Math.PI * 2);
    context.fill();
};

BULANCI.TableMap.prototype.drawUrinalBlock = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;

    context.fillStyle = '#a79575';
    context.fillRect(x, y, w, h);

    this.drawUrinal(context, x + 12, y + 18, w - 24, h * 0.34);
    this.drawUrinal(context, x + 12, y + h * 0.56, w - 24, h * 0.34);

    context.strokeStyle = '#726047';
    context.lineWidth = 3;
    context.strokeRect(x, y, w, h);
};

BULANCI.TableMap.prototype.drawUrinal = function(context, x, y, w, h) {
    context.fillStyle = '#edeee8';
    context.beginPath();
    context.roundRect(x, y, w, h, 10);
    context.fill();

    context.strokeStyle = '#a1a59f';
    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = '#d3d8d2';
    context.beginPath();
    context.ellipse(x + w / 2, y + h * 0.55, w * 0.22, h * 0.18, 0, 0, Math.PI * 2);
    context.fill();
};

BULANCI.TableMap.prototype.drawRadiator = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;
    var ribs = Math.max(6, Math.round(w / 32));
    var ribWidth = (w - 18) / ribs;

    context.fillStyle = '#846d4d';
    context.fillRect(x, y, w, h);

    context.fillStyle = '#bc9c64';
    for (var i = 0; i < ribs; i++) {
        context.fillRect(x + 8 + i * ribWidth, y + 7, ribWidth - 6, h - 14);
    }

    context.strokeStyle = '#5b472c';
    context.lineWidth = 3;
    context.strokeRect(x, y, w, h);
};

BULANCI.TableMap.prototype.drawBucket = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;

    context.fillStyle = '#b87d2e';
    context.beginPath();
    context.ellipse(x + w / 2, y + h / 2, w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#8f5c1a';
    context.beginPath();
    context.ellipse(x + w / 2, y + h / 2, w * 0.28, h * 0.28, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = '#d2aa69';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(x + w / 2, y + h / 2, w * 0.32, Math.PI * 0.2, Math.PI * 0.8, true);
    context.stroke();
};

BULANCI.TableMap.prototype.drawPipeRack = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;

    context.fillStyle = '#6d614f';
    context.fillRect(x, y, w, h);

    context.strokeStyle = '#c19b62';
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(x + 18, y + h * 0.24);
    context.lineTo(x + w - 18, y + h * 0.24);
    context.moveTo(x + 22, y + h * 0.5);
    context.lineTo(x + w - 22, y + h * 0.5);
    context.moveTo(x + 26, y + h * 0.76);
    context.lineTo(x + w - 26, y + h * 0.76);
    context.stroke();

    context.strokeStyle = '#473826';
    context.lineWidth = 3;
    context.strokeRect(x, y, w, h);
};

BULANCI.TableMap.prototype.drawMaintenanceCart = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;

    context.fillStyle = '#806d50';
    context.fillRect(x, y, w, h);

    context.fillStyle = '#99a766';
    context.fillRect(x + 8, y + 8, w - 16, h * 0.28);
    context.fillStyle = '#d1bf72';
    context.fillRect(x + 12, y + h * 0.46, w * 0.24, h * 0.24);
    context.fillRect(x + w - 12 - w * 0.24, y + h * 0.46, w * 0.24, h * 0.24);
    context.fillStyle = '#422f24';
    context.beginPath();
    context.arc(x + 16, y + h - 6, 7, 0, Math.PI * 2);
    context.arc(x + w - 16, y + h - 6, 7, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = '#564530';
    context.lineWidth = 3;
    context.strokeRect(x, y, w, h);
};

BULANCI.TableMap.prototype.drawAtmosphere = function(context, width, height) {
    context.save();
    context.fillStyle = 'rgba(87, 64, 30, 0.1)';
    this.drawStain(context, width * 0.14, height * 0.22, 40, 22);
    this.drawStain(context, width * 0.83, height * 0.26, 34, 18);
    this.drawStain(context, width * 0.61, height * 0.59, 44, 18);

    context.fillStyle = 'rgba(110, 96, 56, 0.14)';
    this.drawStain(context, width * 0.24, height * 0.72, 36, 16);
    this.drawStain(context, width * 0.56, height * 0.84, 54, 20);
    context.restore();
};

BULANCI.TableMap.prototype.drawStain = function(context, x, y, radiusX, radiusY) {
    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, Math.sin(x + y) * 0.12, 0, Math.PI * 2);
    context.fill();
};

BULANCI.TableMap.prototype.drawFloorDrain = function(context, x, y) {
    context.fillStyle = '#40463f';
    context.beginPath();
    context.arc(x, y, 16, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = '#8e988e';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, 16, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = '#6e776e';
    context.beginPath();
    context.moveTo(x - 8, y);
    context.lineTo(x + 8, y);
    context.moveTo(x, y - 8);
    context.lineTo(x, y + 8);
    context.moveTo(x - 6, y - 6);
    context.lineTo(x + 6, y + 6);
    context.moveTo(x + 6, y - 6);
    context.lineTo(x - 6, y + 6);
    context.stroke();
};

BULANCI.TableMap.prototype.drawGraffiti = function(context, x, y, scale) {
    context.save();
    context.translate(x, y);
    context.rotate(-0.22);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.fillStyle = 'rgba(124, 20, 28, 0.14)';
    context.beginPath();
    context.ellipse(10 * scale, 10 * scale, 106 * scale, 26 * scale, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = 'rgba(160, 26, 34, 0.88)';
    context.lineWidth = 6 * scale;
    context.beginPath();
    context.moveTo(-72 * scale, -10 * scale);
    context.bezierCurveTo(-94 * scale, -40 * scale, -132 * scale, -2 * scale, -72 * scale, 34 * scale);
    context.bezierCurveTo(-18 * scale, 2 * scale, 6 * scale, -38 * scale, -18 * scale, -12 * scale);
    context.bezierCurveTo(-32 * scale, -38 * scale, -68 * scale, -34 * scale, -72 * scale, -10 * scale);
    context.stroke();

    context.beginPath();
    context.moveTo(-78 * scale, 18 * scale);
    context.lineTo(-84 * scale, 34 * scale);
    context.moveTo(-64 * scale, 24 * scale);
    context.lineTo(-68 * scale, 42 * scale);
    context.stroke();

    context.font = 'italic bold ' + Math.round(30 * scale) + 'px "Helvetica"';
    context.fillStyle = 'rgba(160, 26, 34, 0.92)';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillText('scarlet', -4 * scale, 10 * scale);

    context.strokeStyle = 'rgba(97, 16, 21, 0.26)';
    context.lineWidth = 9 * scale;
    context.beginPath();
    context.moveTo(-78 * scale, -8 * scale);
    context.lineTo(84 * scale, 12 * scale);
    context.stroke();
    context.restore();
};

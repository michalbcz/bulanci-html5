/**
 * Table Map - A map with a wooden table background and food obstacles
 * Players cannot walk through or shoot through food items on the table
 * 
 * @class TableMap
 * @constructor
 * @author Generated
 */
BULANCI.TableMap = function() {
    this.obstacles = [];
    this.initObstacles();
}

/**
 * Initialize food obstacles on the table
 * Each obstacle has x, y, width, height properties for collision detection
 */
BULANCI.TableMap.prototype.initObstacles = function() {
    // Food items as obstacles - positioned relative to typical game canvas
    // These will be drawn and act as collision objects
    
    // Plate with food (center-left)
    this.obstacles.push({
        x: 150,
        y: 200,
        width: 120,
        height: 100,
        type: 'plate',
        color: '#FFFFFF',
        foodColor: '#8B4513'
    });
    
    // Pizza (center)
    this.obstacles.push({
        x: 450,
        y: 150,
        width: 140,
        height: 140,
        type: 'pizza',
        color: '#FFD700'
    });
    
    // Bowl of soup (top-right)
    this.obstacles.push({
        x: 700,
        y: 100,
        width: 90,
        height: 80,
        type: 'bowl',
        color: '#FFA500'
    });
    
    // Cake (bottom-center)
    this.obstacles.push({
        x: 400,
        y: 400,
        width: 100,
        height: 80,
        type: 'cake',
        color: '#FFB6C1'
    });
    
    // Burger (left side)
    this.obstacles.push({
        x: 100,
        y: 400,
        width: 80,
        height: 70,
        type: 'burger',
        color: '#D2691E'
    });
    
    // Salad bowl (right side)
    this.obstacles.push({
        x: 750,
        y: 350,
        width: 100,
        height: 90,
        type: 'salad',
        color: '#32CD32'
    });
    
    // Glass of drink (top-left)
    this.obstacles.push({
        x: 200,
        y: 80,
        width: 50,
        height: 80,
        type: 'glass',
        color: '#87CEEB'
    });
    
    // Bread basket (center-right)
    this.obstacles.push({
        x: 600,
        y: 300,
        width: 90,
        height: 70,
        type: 'bread',
        color: '#DEB887'
    });
};

/**
 * Get all obstacles for collision detection
 */
BULANCI.TableMap.prototype.getObstacles = function() {
    return this.obstacles;
};

/**
 * Draw the table background and all food obstacles
 */
BULANCI.TableMap.prototype.draw = function(context, images) {
    var canvas = context.canvas;
    
    // Draw wooden table background
    this.drawTableBackground(context, canvas.width, canvas.height);
    
    // Draw all food obstacles
    for (var i = 0; i < this.obstacles.length; i++) {
        this.drawObstacle(context, this.obstacles[i]);
    }
};

/**
 * Draw the wooden table surface
 */
BULANCI.TableMap.prototype.drawTableBackground = function(context, width, height) {
    // Base wood color
    context.fillStyle = '#8B4513';
    context.fillRect(0, 0, width, height);
    
    // Wood grain pattern
    context.strokeStyle = '#6B3510';
    context.lineWidth = 2;
    
    // Draw horizontal wood grain lines
    for (var y = 0; y < height; y += 40) {
        context.beginPath();
        context.moveTo(0, y);
        
        // Create wavy wood grain
        for (var x = 0; x < width; x += 20) {
            var offset = Math.sin(x * 0.02 + y * 0.01) * 3;
            context.lineTo(x, y + offset);
        }
        context.stroke();
    }
    
    // Add some wood knots
    context.fillStyle = '#5D2906';
    this.drawWoodKnot(context, 100, 150, 15);
    this.drawWoodKnot(context, 500, 80, 12);
    this.drawWoodKnot(context, 800, 250, 18);
    this.drawWoodKnot(context, 300, 450, 14);
    this.drawWoodKnot(context, 650, 500, 16);
    
    // Table edge/border
    context.strokeStyle = '#4A2000';
    context.lineWidth = 8;
    context.strokeRect(4, 4, width - 8, height - 8);
    
    // Inner border highlight
    context.strokeStyle = '#A0522D';
    context.lineWidth = 2;
    context.strokeRect(12, 12, width - 24, height - 24);
};

/**
 * Draw a wood knot detail
 */
BULANCI.TableMap.prototype.drawWoodKnot = function(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    
    // Inner ring
    context.strokeStyle = '#4A2000';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(x, y, radius * 0.6, 0, Math.PI * 2);
    context.stroke();
};

/**
 * Draw individual food obstacle based on its type
 */
BULANCI.TableMap.prototype.drawObstacle = function(context, obstacle) {
    var x = obstacle.x;
    var y = obstacle.y;
    var w = obstacle.width;
    var h = obstacle.height;
    
    // Draw shadow first
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.beginPath();
    context.ellipse(x + w/2 + 5, y + h + 5, w/2, h/6, 0, 0, Math.PI * 2);
    context.fill();
    
    switch (obstacle.type) {
        case 'plate':
            this.drawPlate(context, x, y, w, h);
            break;
        case 'pizza':
            this.drawPizza(context, x, y, w, h);
            break;
        case 'bowl':
            this.drawBowl(context, x, y, w, h, obstacle.color);
            break;
        case 'cake':
            this.drawCake(context, x, y, w, h);
            break;
        case 'burger':
            this.drawBurger(context, x, y, w, h);
            break;
        case 'salad':
            this.drawSalad(context, x, y, w, h);
            break;
        case 'glass':
            this.drawGlass(context, x, y, w, h);
            break;
        case 'bread':
            this.drawBread(context, x, y, w, h);
            break;
        default:
            // Generic rectangle obstacle
            context.fillStyle = obstacle.color;
            context.fillRect(x, y, w, h);
    }
};

BULANCI.TableMap.prototype.drawPlate = function(context, x, y, w, h) {
    // White plate
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
    context.fill();
    
    // Plate rim
    context.strokeStyle = '#DDDDDD';
    context.lineWidth = 3;
    context.stroke();
    
    // Food on plate (steak)
    context.fillStyle = '#8B4513';
    context.beginPath();
    context.ellipse(x + w/2, y + h/2, w/3, h/3, 0, 0, Math.PI * 2);
    context.fill();
    
    // Grill marks
    context.strokeStyle = '#5D2906';
    context.lineWidth = 2;
    for (var i = -2; i <= 2; i++) {
        context.beginPath();
        context.moveTo(x + w/2 - w/4, y + h/2 + i * 8);
        context.lineTo(x + w/2 + w/4, y + h/2 + i * 8);
        context.stroke();
    }
};

BULANCI.TableMap.prototype.drawPizza = function(context, x, y, w, h) {
    var centerX = x + w/2;
    var centerY = y + h/2;
    var radius = Math.min(w, h) / 2;
    
    // Pizza base (crust)
    context.fillStyle = '#DEB887';
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
    
    // Tomato sauce
    context.fillStyle = '#FF6347';
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
    context.fill();
    
    // Cheese
    context.fillStyle = '#FFD700';
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    context.fill();
    
    // Pepperoni
    context.fillStyle = '#8B0000';
    var pepperoniPositions = [
        [0.3, 0.3], [-0.3, 0.3], [0, -0.4], [0.4, -0.1], [-0.4, -0.1], [0.2, 0], [-0.2, -0.2]
    ];
    for (var i = 0; i < pepperoniPositions.length; i++) {
        context.beginPath();
        context.arc(
            centerX + pepperoniPositions[i][0] * radius,
            centerY + pepperoniPositions[i][1] * radius,
            radius * 0.12,
            0, Math.PI * 2
        );
        context.fill();
    }
    
    // Pizza slice lines
    context.strokeStyle = '#DEB887';
    context.lineWidth = 2;
    for (var angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        context.stroke();
    }
};

BULANCI.TableMap.prototype.drawBowl = function(context, x, y, w, h, contentColor) {
    // Bowl
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
    context.fill();
    
    // Bowl rim
    context.strokeStyle = '#CCCCCC';
    context.lineWidth = 3;
    context.stroke();
    
    // Soup/content
    context.fillStyle = contentColor;
    context.beginPath();
    context.ellipse(x + w/2, y + h/2, w/2.5, h/2.5, 0, 0, Math.PI * 2);
    context.fill();
};

BULANCI.TableMap.prototype.drawCake = function(context, x, y, w, h) {
    // Cake base
    context.fillStyle = '#FFB6C1';
    context.fillRect(x + 10, y + h/3, w - 20, h * 2/3);
    
    // Cake top (frosting)
    context.fillStyle = '#FFC0CB';
    context.beginPath();
    context.ellipse(x + w/2, y + h/3, w/2 - 10, h/6, 0, 0, Math.PI * 2);
    context.fill();
    
    // Cream decorations
    context.fillStyle = '#FFFFFF';
    for (var i = 0; i < 5; i++) {
        context.beginPath();
        context.arc(x + 15 + i * (w - 30) / 4, y + h/3 - 5, 8, 0, Math.PI * 2);
        context.fill();
    }
    
    // Cherry on top
    context.fillStyle = '#DC143C';
    context.beginPath();
    context.arc(x + w/2, y + h/4 - 5, 8, 0, Math.PI * 2);
    context.fill();
};

BULANCI.TableMap.prototype.drawBurger = function(context, x, y, w, h) {
    // Bottom bun
    context.fillStyle = '#DEB887';
    context.beginPath();
    context.ellipse(x + w/2, y + h - 15, w/2, h/6, 0, 0, Math.PI);
    context.fill();
    context.fillRect(x, y + h - 25, w, 10);
    
    // Patty
    context.fillStyle = '#8B4513';
    context.fillRect(x + 5, y + h/2, w - 10, 15);
    
    // Lettuce
    context.fillStyle = '#32CD32';
    context.beginPath();
    for (var i = 0; i < w; i += 10) {
        context.arc(x + i + 5, y + h/2 - 3, 8, 0, Math.PI, true);
    }
    context.fill();
    
    // Cheese
    context.fillStyle = '#FFD700';
    context.beginPath();
    context.moveTo(x, y + h/2 - 8);
    context.lineTo(x + w, y + h/2 - 8);
    context.lineTo(x + w - 5, y + h/2 - 3);
    context.lineTo(x + 5, y + h/2 - 3);
    context.closePath();
    context.fill();
    
    // Top bun
    context.fillStyle = '#DEB887';
    context.beginPath();
    context.ellipse(x + w/2, y + 20, w/2, h/3, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.fillRect(x, y + 20, w, 15);
    
    // Sesame seeds
    context.fillStyle = '#FFFACD';
    for (var i = 0; i < 5; i++) {
        context.beginPath();
        context.ellipse(x + 10 + i * 15, y + 15, 3, 5, Math.random(), 0, Math.PI * 2);
        context.fill();
    }
};

BULANCI.TableMap.prototype.drawSalad = function(context, x, y, w, h) {
    // Bowl
    context.fillStyle = '#8B4513';
    context.beginPath();
    context.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
    context.fill();
    
    // Inner bowl
    context.fillStyle = '#A0522D';
    context.beginPath();
    context.ellipse(x + w/2, y + h/2, w/2.3, h/2.3, 0, 0, Math.PI * 2);
    context.fill();
    
    // Salad greens
    context.fillStyle = '#228B22';
    context.beginPath();
    context.ellipse(x + w/2, y + h/2 - 5, w/2.5, h/2.5, 0, 0, Math.PI * 2);
    context.fill();
    
    // Lighter green leaves
    context.fillStyle = '#32CD32';
    for (var i = 0; i < 6; i++) {
        context.beginPath();
        context.ellipse(
            x + w/2 + Math.cos(i) * w/4,
            y + h/2 - 5 + Math.sin(i) * h/5,
            12, 8, i, 0, Math.PI * 2
        );
        context.fill();
    }
    
    // Tomato slices
    context.fillStyle = '#FF6347';
    context.beginPath();
    context.arc(x + w/3, y + h/3, 8, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(x + w * 2/3, y + h/2, 7, 0, Math.PI * 2);
    context.fill();
};

BULANCI.TableMap.prototype.drawGlass = function(context, x, y, w, h) {
    // Glass body (transparent effect)
    context.fillStyle = 'rgba(200, 230, 255, 0.6)';
    context.beginPath();
    context.moveTo(x + 5, y);
    context.lineTo(x + w - 5, y);
    context.lineTo(x + w - 10, y + h);
    context.lineTo(x + 10, y + h);
    context.closePath();
    context.fill();
    
    // Glass outline
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 2;
    context.stroke();
    
    // Liquid
    context.fillStyle = 'rgba(255, 165, 0, 0.7)';
    context.beginPath();
    context.moveTo(x + 8, y + h/3);
    context.lineTo(x + w - 8, y + h/3);
    context.lineTo(x + w - 10, y + h - 5);
    context.lineTo(x + 10, y + h - 5);
    context.closePath();
    context.fill();
    
    // Ice cubes
    context.fillStyle = 'rgba(255, 255, 255, 0.5)';
    context.fillRect(x + 15, y + h/2, 10, 10);
    context.fillRect(x + w - 25, y + h/2 + 10, 8, 8);
    
    // Glass highlight
    context.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x + 8, y + 10);
    context.lineTo(x + 12, y + h - 10);
    context.stroke();
};

BULANCI.TableMap.prototype.drawBread = function(context, x, y, w, h) {
    // Basket
    context.fillStyle = '#D2691E';
    context.beginPath();
    context.ellipse(x + w/2, y + h - 10, w/2, h/4, 0, 0, Math.PI);
    context.fill();
    context.fillRect(x, y + h/3, w, h/2);
    
    // Basket weave pattern
    context.strokeStyle = '#8B4513';
    context.lineWidth = 2;
    for (var i = 0; i < w; i += 10) {
        context.beginPath();
        context.moveTo(x + i, y + h/3);
        context.lineTo(x + i, y + h - 10);
        context.stroke();
    }
    
    // Bread loaves
    context.fillStyle = '#DEB887';
    // Baguette
    context.beginPath();
    context.ellipse(x + w/2, y + h/4, w/2.5, h/6, -0.3, 0, Math.PI * 2);
    context.fill();
    
    // Round bread
    context.beginPath();
    context.arc(x + w/3, y + h/3 + 5, 15, 0, Math.PI * 2);
    context.fill();
    
    // Bread roll
    context.beginPath();
    context.ellipse(x + w * 2/3 + 5, y + h/3 + 5, 12, 10, 0.5, 0, Math.PI * 2);
    context.fill();
    
    // Bread details (scoring lines)
    context.strokeStyle = '#C4A574';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x + w/2 - 20, y + h/4 - 3);
    context.lineTo(x + w/2 + 20, y + h/4 - 3);
    context.stroke();
};

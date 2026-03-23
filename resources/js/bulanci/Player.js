/**
 * Player representing character of the game
 *
 * @class Player
 * @constructor
 * @author Michal Vlcek <mychalvlcek@gmail.com>
 */
BULANCI.Player = function(suffix) {
    BULANCI.Player._superClass.constructor.call(this);

    this.x = 50;
    this.y = 50;

    this.width = 54;
    this.height = 56;

    this.direction = 1;
    this.moveInc = 8;

    this.spritePosition = 0;
    this.imageSuffix = suffix || '';

    this.isAlive = true;

    this.score = 0;
    this.kills = 0;
    this.deaths = 0;

    this.color = 0;

    this.shooting = false;
    this.shootSpeed = 25;

    this.shoots = [];
    this.mapObstacles = [];
}
inherits(BULANCI.Player, BULANCI.GameObject);

BULANCI.Player.prototype.death = function() {
    this.isAlive = false;
    this.deaths++;
};

BULANCI.Player.prototype.restart = function() {
    this.score = 0;
    this.kills = 0;
    this.deaths = 0;
    this.shoots = [];
    this.shooting = false;
};

BULANCI.Player.prototype.respawn = function(maxWidth, maxHeight, obstacles) {
    this.x = -100;
    this.y = -100;
    setTimeout(this.spawn.bind(this, maxWidth, maxHeight, obstacles), 500);
};

BULANCI.Player.prototype.spawn = function(maxWidth, maxHeight, obstacles) {
    this.x = Math.random() * (maxWidth - 150) + 50;
    this.y = Math.random() * (maxHeight - 150) + 50;

    while (this.hasCollision(this.x, this.y, obstacles)) {
        this.x = Math.random() * (maxWidth - 150) + 50;
        this.y = Math.random() * (maxHeight - 150) + 50;
    }

    this.isAlive = true;
};

BULANCI.Player.prototype.move = function(key, canvas, obstacles) {
    if (!this.isAlive) {
        return;
    }

    this.direction = key;
    this.spritePosition = (this.spritePosition < 700) ? this.spritePosition + 95 : 0;

    switch (this.direction) {
        case 1:
            if (this.x > 0 && !this.hasCollision(this.x - this.moveInc, this.y, obstacles)) {
                this.x -= this.moveInc;
            }
            break;
        case 3:
            if (this.x < canvas.width - this.width && !this.hasCollision(this.x + this.moveInc, this.y, obstacles)) {
                this.x += this.moveInc;
            }
            break;
        case 2:
            if (this.y > 0 && !this.hasCollision(this.x, this.y - this.moveInc, obstacles)) {
                this.y -= this.moveInc;
            }
            break;
        case 4:
            if (this.y < canvas.height - this.height && !this.hasCollision(this.x, this.y + this.moveInc, obstacles)) {
                this.y += this.moveInc;
            }
            break;
    }
};

BULANCI.Player.prototype.hasCollision = function(x, y, obstacles) {
    for (var i = 0; i < obstacles.length; i++) {
        var rect = obstacles[i];

        if (this !== rect) {
            if (x + this.width < rect.x || rect.x + rect.width < x || y + this.height < rect.y || rect.y + rect.height < y) {
                continue;
            }

            return true;
        }
    }

    return false;
};

BULANCI.Player.prototype.activeShooting = function() {
    if (this.shooting === true) {
        this.shooting = false;
    }
};

BULANCI.Player.prototype.shoot = function() {
    if (this.shooting === false && this.isAlive) {
        if (BULANCI.Audio && BULANCI.Audio.playRandomFart) {
            BULANCI.Audio.playRandomFart();
        }

        var shoot = new BULANCI.Shoot(this.x, this.y, this.mapObstacles);
        shoot.launch(this.shootSpeed, this.direction);
        this.shoots.push(shoot);
        this.shooting = true;

        setTimeout(this.activeShooting.bind(this), 400);
    }
};

BULANCI.Player.prototype.setMapObstacles = function(obstacles) {
    this.mapObstacles = obstacles;
};

BULANCI.Player.prototype.drawHitbox = function(context) {
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.strokeStyle = 'rgba(255,0,0,0.8)';
    context.lineWidth = 0.5;
    context.stroke();
};

BULANCI.Player.prototype.draw = function(context) {
    for (var i = 0; i < this.shoots.length; i++) {
        if (this.shoots[i].getIsActive()) {
            this.shoots[i].draw(context);
        } else {
            this.shoots.splice(i, 1);
            i--;
        }
    }

    this.drawShadow(context);
    this.drawBody(context);
};

BULANCI.Player.prototype.uniform = function(xRatio, yRatio) {
    this.x = this.x * xRatio;
    this.y = this.y * yRatio;
};

BULANCI.Player.prototype.drawShadow = function(context) {
    context.save();
    context.fillStyle = 'rgba(0,0,0,0.28)';
    context.beginPath();
    context.ellipse(this.x + this.width / 2, this.y + this.height + 6, this.width / 2.3, 8, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
};

BULANCI.Player.prototype.drawBody = function(context) {
    var body = this.getBodyPalette();
    var accent = this.getAccentColor();
    var centerX = this.x + this.width / 2;

    context.save();

    context.fillStyle = body.dark;
    context.beginPath();
    context.ellipse(centerX, this.y + this.height - 12, this.width / 2, 14, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = body.mid;
    context.beginPath();
    context.ellipse(centerX, this.y + this.height - 24, this.width / 2.4, 12, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = body.base;
    context.beginPath();
    context.ellipse(centerX, this.y + this.height - 38, this.width / 3.1, 10, 0, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.moveTo(centerX - 8, this.y + 10);
    context.bezierCurveTo(centerX - 2, this.y + 2, centerX + 10, this.y + 4, centerX + 8, this.y + 18);
    context.bezierCurveTo(centerX + 10, this.y + 22, centerX + 4, this.y + 24, centerX - 2, this.y + 23);
    context.bezierCurveTo(centerX - 8, this.y + 21, centerX - 12, this.y + 18, centerX - 8, this.y + 10);
    context.fill();

    context.strokeStyle = body.line;
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(centerX, this.y + this.height - 12, this.width / 2, 14, 0, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.ellipse(centerX, this.y + this.height - 24, this.width / 2.4, 12, 0, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.ellipse(centerX, this.y + this.height - 38, this.width / 3.1, 10, 0, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX - 8, this.y + 10);
    context.bezierCurveTo(centerX - 2, this.y + 2, centerX + 10, this.y + 4, centerX + 8, this.y + 18);
    context.bezierCurveTo(centerX + 10, this.y + 22, centerX + 4, this.y + 24, centerX - 2, this.y + 23);
    context.bezierCurveTo(centerX - 8, this.y + 21, centerX - 12, this.y + 18, centerX - 8, this.y + 10);
    context.stroke();

    context.fillStyle = 'rgba(255, 242, 198, 0.2)';
    context.beginPath();
    context.ellipse(centerX - 8, this.y + this.height - 28, 8, 16, -0.5, 0, Math.PI * 2);
    context.fill();

    this.drawAccent(context, accent);
    this.drawFace(context, body.line);

    context.restore();
};

BULANCI.Player.prototype.drawAccent = function(context, accent) {
    var badgeX = this.x + this.width / 2;
    var badgeY = this.y + this.height - 26;

    if (this.direction === 1) {
        badgeX -= 12;
    }
    if (this.direction === 3) {
        badgeX += 12;
    }
    if (this.direction === 2) {
        badgeY -= 4;
    }

    context.fillStyle = accent;
    context.beginPath();
    context.arc(badgeX, badgeY, 6, 0, Math.PI * 2);
    context.fill();
};

BULANCI.Player.prototype.drawFace = function(context, strokeColor) {
    var eyeOffsetX = 9;
    var eyeY = this.y + this.height - 38;
    var centerX = this.x + this.width / 2;
    var pupilShift = 0;

    if (this.direction === 1) {
        pupilShift = -1.5;
    }
    if (this.direction === 3) {
        pupilShift = 1.5;
    }

    if (this.direction !== 2) {
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(centerX - eyeOffsetX, eyeY, 5, 0, Math.PI * 2);
        context.arc(centerX + eyeOffsetX, eyeY, 5, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = '#1b110b';
        context.beginPath();
        context.arc(centerX - eyeOffsetX + pupilShift, eyeY, 2.3, 0, Math.PI * 2);
        context.arc(centerX + eyeOffsetX + pupilShift, eyeY, 2.3, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = strokeColor;
        context.lineWidth = 1.5;
        context.beginPath();
        context.arc(centerX, this.y + this.height - 24, 6, 0.15 * Math.PI, 0.85 * Math.PI);
        context.stroke();
        return;
    }

    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(centerX, this.y + this.height - 27, 7, 1.1 * Math.PI, 1.9 * Math.PI);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX - 8, this.y + this.height - 35);
    context.lineTo(centerX + 8, this.y + this.height - 35);
    context.stroke();
};

BULANCI.Player.prototype.getBodyPalette = function() {
    if (this.imageSuffix === '-blue') {
        return {
            base: '#c39a47',
            mid: '#a77f2d',
            dark: '#886218',
            line: '#5c3f0e'
        };
    }

    return {
        base: '#966636',
        mid: '#7a4a23',
        dark: '#613414',
        line: '#3d1f0a'
    };
};

BULANCI.Player.prototype.getAccentColor = function() {
    return (this.imageSuffix === '-blue') ? '#d6c15a' : '#cf5b54';
};

BULANCI.Player.prototype.isShootedBy = function(x1, y1) {
    if (x1 >= this.x && x1 <= this.x + this.width) {
        if (y1 >= this.y && y1 <= this.y + this.height) {
            return true;
        }
    }

    return false;
};

BULANCI.Player.prototype.isNearMissBy = function(x1, y1, padding) {
    var missPadding = padding || 28;

    if (this.isShootedBy(x1, y1)) {
        return false;
    }

    return x1 >= this.x - missPadding &&
        x1 <= this.x + this.width + missPadding &&
        y1 >= this.y - missPadding &&
        y1 <= this.y + this.height + missPadding;
};

BULANCI.Player.prototype.getShoots = function() {
    return this.shoots;
};

BULANCI.Player.prototype.getScore = function() {
    return this.score;
};

BULANCI.Player.prototype.setScore = function() {
    this.score++;
};

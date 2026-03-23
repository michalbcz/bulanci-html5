/**
 * Bomb inspired by classic Bomberman cross explosions.
 *
 * @class Bomb
 * @constructor
 */
BULANCI.Bomb = function(centerX, groundY, ownerIndex, arenaWidth, arenaHeight) {
    BULANCI.Bomb._superClass.constructor.call(this);

    this.ownerIndex = ownerIndex;
    this.centerX = centerX;
    this.centerY = groundY;
    this.width = 34;
    this.height = 34;

    this.placedAt = Date.now();
    this.fuseDuration = 3000;
    this.explosionDuration = 550;
    this.explosionStartedAt = 0;
    this.state = 'ticking';
    this.damageResolved = false;

    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;
    this.beamThickness = 68;
    this.lastTickSecond = 3;

    this.syncPosition();
};
inherits(BULANCI.Bomb, BULANCI.GameObject);

BULANCI.Bomb.prototype.syncPosition = function() {
    this.x = this.centerX - this.width / 2;
    this.y = this.centerY - this.height + 4;
};

BULANCI.Bomb.prototype.update = function(now) {
    var remainingMs;
    var remainingSeconds;

    if (this.state === 'ticking') {
        remainingMs = this.fuseDuration - (now - this.placedAt);
        remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        if (remainingSeconds !== this.lastTickSecond) {
            this.lastTickSecond = remainingSeconds;
        }

        if (remainingMs <= 0) {
            this.state = 'exploding';
            this.explosionStartedAt = now;
            return true;
        }
    }

    if (this.state === 'exploding' && now - this.explosionStartedAt >= this.explosionDuration) {
        this.state = 'done';
    }

    return false;
};

BULANCI.Bomb.prototype.resize = function(xRatio, yRatio, arenaWidth, arenaHeight) {
    this.centerX = this.centerX * xRatio;
    this.centerY = this.centerY * yRatio;
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;
    this.syncPosition();
};

BULANCI.Bomb.prototype.isExploding = function() {
    return this.state === 'exploding';
};

BULANCI.Bomb.prototype.isDone = function() {
    return this.state === 'done';
};

BULANCI.Bomb.prototype.draw = function(context) {
    if (this.state === 'ticking') {
        this.drawBomb(context);
        return;
    }

    if (this.state === 'exploding') {
        this.drawExplosion(context);
    }
};

BULANCI.Bomb.prototype.drawBomb = function(context) {
    var now = Date.now();
    var progress = Math.min(1, (now - this.placedAt) / this.fuseDuration);
    var pulse = 1 + Math.sin(now / 90) * 0.04;
    var fuseStartX = this.x + this.width * 0.62;
    var fuseStartY = this.y + 4;
    var fuseEndX = this.x + this.width * 0.84 - progress * 8;
    var fuseEndY = this.y - 10 + progress * 6;

    context.save();
    context.fillStyle = 'rgba(0,0,0,0.22)';
    context.beginPath();
    context.ellipse(this.centerX, this.y + this.height + 5, 20, 7, 0, 0, Math.PI * 2);
    context.fill();

    context.translate(this.centerX, this.centerY - 16);
    context.scale(pulse, pulse);
    context.translate(-this.centerX, -(this.centerY - 16));

    context.fillStyle = '#5e3415';
    context.beginPath();
    context.ellipse(this.centerX, this.y + this.height - 3, 17, 9, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#7a4721';
    context.beginPath();
    context.ellipse(this.centerX, this.y + this.height - 12, 13, 8, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#986135';
    context.beginPath();
    context.ellipse(this.centerX, this.y + this.height - 20, 10, 7, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = '#3a1d09';
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(this.centerX, this.y + this.height - 3, 17, 9, 0, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.ellipse(this.centerX, this.y + this.height - 12, 13, 8, 0, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.ellipse(this.centerX, this.y + this.height - 20, 10, 7, 0, 0, Math.PI * 2);
    context.stroke();

    context.translate(this.centerX + 3, this.y + this.height - 25);
    context.rotate(-0.42);
    context.fillStyle = '#c3412e';
    context.fillRect(-4, -18, 8, 22);
    context.fillStyle = '#efe1a4';
    context.fillRect(-4, -11, 8, 3);
    context.strokeStyle = '#641f13';
    context.lineWidth = 1.4;
    context.strokeRect(-4, -18, 8, 22);
    context.restore();

    context.save();
    context.strokeStyle = '#2a2418';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(fuseStartX, fuseStartY);
    context.quadraticCurveTo(this.x + this.width + 6, this.y - 6, fuseEndX, fuseEndY);
    context.stroke();

    context.fillStyle = 'rgba(255, 150, 56, 0.75)';
    context.beginPath();
    context.arc(fuseEndX, fuseEndY, 8 + Math.sin(now / 55) * 1.4, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffe27a';
    context.beginPath();
    context.arc(fuseEndX, fuseEndY, 4.5, 0, Math.PI * 2);
    context.fill();
    context.restore();
};

BULANCI.Bomb.prototype.drawExplosion = function(context) {
    var progress = Math.min(1, (Date.now() - this.explosionStartedAt) / this.explosionDuration);
    var beamThickness = this.beamThickness * (1 - progress * 0.22);
    var alpha = Math.max(0, 1 - progress);
    var horizontalGradient = context.createLinearGradient(0, this.centerY, this.arenaWidth, this.centerY);
    var verticalGradient = context.createLinearGradient(this.centerX, 0, this.centerX, this.arenaHeight);

    horizontalGradient.addColorStop(0, 'rgba(255, 226, 124, 0)');
    horizontalGradient.addColorStop(0.18, 'rgba(255, 191, 71, ' + (0.62 * alpha) + ')');
    horizontalGradient.addColorStop(0.5, 'rgba(255, 237, 161, ' + alpha + ')');
    horizontalGradient.addColorStop(0.82, 'rgba(255, 191, 71, ' + (0.62 * alpha) + ')');
    horizontalGradient.addColorStop(1, 'rgba(255, 226, 124, 0)');

    verticalGradient.addColorStop(0, 'rgba(255, 226, 124, 0)');
    verticalGradient.addColorStop(0.18, 'rgba(255, 191, 71, ' + (0.62 * alpha) + ')');
    verticalGradient.addColorStop(0.5, 'rgba(255, 237, 161, ' + alpha + ')');
    verticalGradient.addColorStop(0.82, 'rgba(255, 191, 71, ' + (0.62 * alpha) + ')');
    verticalGradient.addColorStop(1, 'rgba(255, 226, 124, 0)');

    context.save();
    context.fillStyle = horizontalGradient;
    context.fillRect(0, this.centerY - beamThickness / 2, this.arenaWidth, beamThickness);
    context.fillStyle = verticalGradient;
    context.fillRect(this.centerX - beamThickness / 2, 0, beamThickness, this.arenaHeight);

    context.fillStyle = 'rgba(255, 247, 186, ' + alpha + ')';
    context.beginPath();
    context.arc(this.centerX, this.centerY, 26 + progress * 10, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = 'rgba(255, 175, 62, ' + (0.72 * alpha) + ')';
    context.beginPath();
    context.arc(this.centerX, this.centerY, 42 + progress * 8, 0, Math.PI * 2);
    context.fill();
    context.restore();
};

BULANCI.Bomb.prototype.hitsPlayer = function(player) {
    return this.intersectsRect(
        player.x,
        player.y,
        player.width,
        player.height,
        0,
        this.centerY - this.beamThickness / 2,
        this.arenaWidth,
        this.beamThickness
    ) || this.intersectsRect(
        player.x,
        player.y,
        player.width,
        player.height,
        this.centerX - this.beamThickness / 2,
        0,
        this.beamThickness,
        this.arenaHeight
    );
};

BULANCI.Bomb.prototype.intersectsRect = function(ax, ay, aw, ah, bx, by, bw, bh) {
    return !(ax + aw < bx || bx + bw < ax || ay + ah < by || by + bh < ay);
};

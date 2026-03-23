/**
 * Game
 *
 * @class Game
 * @constructor
 * @author Michal Vlcek <mychalvlcek@gmail.com>
 */
BULANCI.Game = function(debug) {
    this.debug = debug;

    this.canvas = null;
    this.context = null;

    this.mouseX = 0;
    this.mouseY = 0;

    this.width = 0;
    this.height = 0;

    this.keys = [];

    this.frameInterval = null;
    this.fpsInterval = null;
    this.fps = 30;
    this.numFramesDrawn = 0;
    this.curFPS = 0;

    this.status = 0;

    this.defaultGametime = 60;
    this.remainingTime = -1;

    this.speed = 15;

    this.imagePath = 'resources/images/';
    this.resources = [];
    this.images = [];
    this.curLoadResNum = 0;

    this.map = null;
    this.players = [];
    this.elementList = [];
    this.hud = [];
    this.activeBomb = null;
    this.floatingTaunts = [];
    this.splatterParticles = [];
    this.nearMissPhrases = ['Fiiiha', 'Ufff', 'Tesne!'];
    this.doubleTapWindow = 260;
    this.lastShootTapAt = [0, 0];
};

BULANCI.Game.prototype.init = function(gameDiv, pCanvas, pheight) {
    this.width = pCanvas;
    this.height = pheight;

    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);
    this.canvas.setAttribute('id', 'canvas');
    gameDiv.appendChild(this.canvas);

    if (typeof G_vmlCanvasManager != 'undefined') {
        this.canvas = G_vmlCanvasManager.initElement(this.canvas);
    }

    this.context = this.canvas.getContext('2d');
    this.context.font = 'bold 12px "Helvetica Neue"';
    this.clearCanvas();

    this.context.fillText('loading...', this.width / 2, this.height / 3);

    document.addEventListener('keydown', this.keyboardPressed.bind(this));
    document.addEventListener('keyup', this.keyboardUnpressed.bind(this));

    this.map = new BULANCI.TableMap(this.width, this.height);

    var mapObstacles = this.map.getObstacles();
    var lulant = new BULANCI.Player('-red');

    lulant.setMapObstacles(mapObstacles);
    lulant.spawn(this.width, this.height, mapObstacles);
    lulant.playerId = 0;
    this.players.push(lulant);

    lulant = new BULANCI.Player('-blue');
    lulant.setMapObstacles(mapObstacles);
    lulant.spawn(this.width, this.height, mapObstacles);
    lulant.playerId = 1;
    this.players.push(lulant);

    this.rebuildElementList(mapObstacles);
    this.initHud();

    if (this.resources.length > 0) {
        this.loadImages();
        return;
    }

    this.start();
};

BULANCI.Game.prototype.initHud = function() {
    this.hud = new BULANCI.HUD();

    var pauseButton = new BULANCI.RoundedButton('Pauza', this.width - 120, this.height - 50, 100, 30);
    pauseButton.stroke = 'rgba(191, 178, 126, 0.8)';
    pauseButton.fill = 'rgba(79, 72, 50, 0.45)';
    pauseButton.hoverStroke = '#f1d276';
    this.hud.elements['pause_btn'] = pauseButton;

    var score1 = new BULANCI.RoundedLabel('zasah: 0', 20, this.height - 50, 100, 30);
    score1.stroke = 'rgba(207, 91, 84, 0.7)';
    score1.fill = 'rgba(78, 27, 20, 0.35)';
    score1.textColor = 'rgba(255,255,255,.88)';
    this.hud.elements['score1'] = score1;

    var score2 = new BULANCI.RoundedLabel('zasah: 0', 140, this.height - 50, 100, 30);
    score2.stroke = 'rgba(214, 193, 90, 0.8)';
    score2.fill = 'rgba(81, 62, 17, 0.35)';
    score2.textColor = 'rgba(255,255,255,.88)';
    this.hud.elements['score2'] = score2;

    var time = new BULANCI.RoundedButton('0', this.width / 2 - 40, this.height - 50, 80, 40);
    time.font = '26px "Helvetica"';
    time.textColor = 'rgba(255,255,255,.9)';
    time.stroke = 'rgba(194, 180, 134, 0.85)';
    time.fill = 'rgba(57, 53, 43, 0.55)';
    time.hoverStroke = '#f1d276';
    this.hud.elements['time'] = time;

    var newGame = new BULANCI.RoundedButton('Spustit splach', this.width / 2 - 120, this.height / 2 - 70, 240, 80);
    newGame.font = '24px "Helvetica"';
    newGame.textColor = 'rgba(255,255,255,.9)';
    newGame.stroke = 'rgba(191, 178, 126, 0.85)';
    newGame.fill = 'rgba(63, 56, 38, 0.8)';
    newGame.hoverStroke = '#f1d276';
    this.hud.elements['newGame'] = newGame;

    var again = new BULANCI.RoundedButton('Jeste jeden splach?', this.width / 2 - 140, this.height / 2 - 50, 280, 70);
    again.font = '24px "Helvetica"';
    again.textColor = 'rgba(255,255,255,.9)';
    again.stroke = 'rgba(191, 178, 126, 0.85)';
    again.fill = 'rgba(63, 56, 38, 0.8)';
    again.hoverStroke = '#f1d276';
    this.hud.elements['again_btn'] = again;
};

/**
 * Main loop of the game.
 * All of the logic is processed here.
 */
BULANCI.Game.prototype.update = function() {
    ++this.numFramesDrawn;
    this.updateFloatingTaunts();
    this.updateSplatterParticles();

    if (this.status === 0) {
        this.drawMenu();
        return;
    }

    if (this.remainingTime > 0) {
        this.processShootHits();
        this.updateBomb();
        this.keyBind();
        this.redraw();
        return;
    }

    this.drawResults();
};

BULANCI.Game.prototype.drawMenu = function() {
    this.map.draw(this.context);
    this.context.fillStyle = 'rgba(12, 11, 8, 0.8)';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';

    this.context.font = '42px "Bank Gothic"';
    this.context.fillStyle = 'rgba(242, 239, 224, 1)';
    this.context.fillText('Lulanci', this.width / 2, 62);

    this.context.font = '16px "Helvetica"';
    this.context.fillStyle = 'rgba(209, 199, 159, 1)';
    this.context.fillText('retro zachodovy souboj, rok 1990', this.width / 2, 92);

    this.drawTitlePoster(this.width / 2 - 160, 120, 320, 130);

    this.context.font = '21px "Helvetica"';
    this.context.fillStyle = 'rgba(207, 91, 84, 0.92)';
    this.context.fillText('Lulant 1', this.width / 4, this.height / 3 + 4);
    this.context.font = '18px "Helvetica"';
    this.context.fillStyle = 'rgba(234, 226, 198, 0.95)';
    this.context.fillText('WASD + mezernik', this.width / 4, this.height / 3 + 36);
    this.context.fillText('slizke lejno + nahodny prd', this.width / 4, this.height / 3 + 64);
    this.context.fillText('2x mezernik = bomba', this.width / 4, this.height / 3 + 92);

    this.context.font = '21px "Helvetica"';
    this.context.fillStyle = 'rgba(214, 193, 90, 0.96)';
    this.context.fillText('Lulant 2', this.width / 4 * 3, this.height / 3 + 4);
    this.context.font = '18px "Helvetica"';
    this.context.fillStyle = 'rgba(234, 226, 198, 0.95)';
    this.context.fillText('sipky + enter', this.width / 4 * 3, this.height / 3 + 36);
    this.context.fillText('utek mezi kabinkami a pisoary', this.width / 4 * 3, this.height / 3 + 64);
    this.context.fillText('2x enter = bomba', this.width / 4 * 3, this.height / 3 + 92);

    this.context.font = '16px "Helvetica"';
    this.context.fillStyle = 'rgba(214, 204, 167, 0.85)';
    this.context.fillText('kdo nasbira vic zasahu do konce smeny, vyhrava', this.width / 2, this.height - 110);

    this.hud.elements['newGame'].redraw(this.context, '', this.width / 2 - 120, this.height / 2 + 80);
};

BULANCI.Game.prototype.drawResults = function() {
    this.map.draw(this.context);
    this.context.fillStyle = 'rgba(12, 11, 8, 0.8)';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.font = '34px "Bank Gothic"';
    this.context.fillStyle = 'rgba(242, 239, 224, 1)';
    this.context.fillText('Konec smeny!', this.width / 2, this.height / 2 - 160);

    this.context.font = '18px "Helvetica"';
    this.context.fillStyle = 'rgba(209, 199, 159, 1)';
    this.context.fillText('spocitani zasahu po zaverecnem splachu', this.width / 2, this.height / 2 - 125);

    this.hud.elements['again_btn'].redraw(this.context, '', this.width / 2 - 140, this.height / 2 - 55);

    var heightRatio = this.height / 3;
    var totalScore = this.players[0].getScore() + this.players[1].getScore();

    if (totalScore === 0) {
        totalScore = 1;
    }

    var score1Height = this.players[0].getScore() * (heightRatio / totalScore);
    var score2Height = this.players[1].getScore() * (heightRatio / totalScore);

    this.context.font = '30px "Helvetica"';

    this.context.beginPath();
    this.context.rect(this.width / 4 - 55, this.height / 5 * 3, 110, -1 * score1Height);
    this.context.strokeStyle = 'rgba(207, 91, 84, 0.92)';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.fillStyle = 'rgba(207, 91, 84, 0.28)';
    this.context.fill();
    this.context.fillStyle = 'rgba(241, 215, 201, 0.92)';
    this.context.fillText(this.players[0].getScore(), this.width / 4, this.height / 4 * 3);

    this.context.beginPath();
    this.context.rect(this.width / 4 * 3 - 55, this.height / 5 * 3, 110, -1 * score2Height);
    this.context.strokeStyle = 'rgba(214, 193, 90, 0.92)';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.fillStyle = 'rgba(214, 193, 90, 0.28)';
    this.context.fill();
    this.context.fillStyle = 'rgba(220, 236, 247, 0.92)';
    this.context.fillText(this.players[1].getScore(), this.width / 4 * 3, this.height / 4 * 3);
};

BULANCI.Game.prototype.drawTitlePoster = function(x, y, width, height) {
    this.context.save();
    this.context.fillStyle = 'rgba(228, 222, 193, 0.96)';
    this.context.strokeStyle = 'rgba(109, 96, 63, 1)';
    this.context.lineWidth = 5;
    this.context.fillRect(x, y, width, height);
    this.context.strokeRect(x, y, width, height);

    this.context.fillStyle = 'rgba(118, 105, 72, 0.12)';
    for (var row = 0; row < 3; row++) {
        this.context.fillRect(x + 14, y + 16 + row * 36, width - 28, 18);
    }

    this.context.fillStyle = '#5c4a2d';
    this.context.font = 'bold 28px "Bank Gothic"';
    this.context.fillText('LULANCI', x + width / 2, y + 42);

    this.context.font = '16px "Helvetica"';
    this.context.fillText('verejne WC CSSR', x + width / 2, y + 78);
    this.context.fillText('slizke lejno v akci', x + width / 2, y + 102);

    this.context.fillStyle = '#cf5b54';
    this.context.beginPath();
    this.context.arc(x + 40, y + height - 26, 8, 0, Math.PI * 2);
    this.context.fill();
    this.context.fillStyle = '#d6c15a';
    this.context.beginPath();
    this.context.arc(x + width - 40, y + height - 26, 8, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
};

BULANCI.Game.prototype.redraw = function() {
    this.clearCanvas();
    this.map.draw(this.context);
    this.drawSplatterParticles();

    if (this.activeBomb && !this.activeBomb.isExploding()) {
        this.activeBomb.draw(this.context);
    }

    this.hud.elements['score1'].redraw(this.context, 'zasah: ' + this.players[0].getScore(), 20, this.height - 50);
    this.hud.elements['score2'].redraw(this.context, 'zasah: ' + this.players[1].getScore(), 140, this.height - 50);
    this.hud.elements['pause_btn'].redraw(this.context, '', this.width - 120, this.height - 50);
    this.hud.elements['time'].redraw(this.context, this.remainingTime.toTimeRemain(), this.width / 2 - 50, this.height - 50);

    for (var i = 0; i < this.players.length; i++) {
        this.players[i].draw(this.context);
    }

    if (this.activeBomb && this.activeBomb.isExploding()) {
        this.activeBomb.draw(this.context);
    }

    this.drawFloatingTaunts();

    if (this.debug) {
        this.printDebugInfo();
    }
};

BULANCI.Game.prototype.handleMouseMove = function(e) {
    this.mouseX = parseInt(e.clientX, 10);
    this.mouseY = parseInt(e.clientY, 10);

    for (var key in this.hud.elements) {
        if (this.hud.elements[key].contains(this.mouseX, this.mouseY) && this.hud.elements[key].clickable && !this.hud.elements[key].isHidden()) {
            window.document.body.style.cursor = 'pointer';
            this.hud.elements[key].hovered = true;
        } else {
            this.hud.elements[key].hovered = false;
            window.document.body.style.cursor = 'auto';
        }
    }
};

BULANCI.Game.prototype.handleMouseClick = function(e) {
    this.mouseX = parseInt(e.clientX, 10);
    this.mouseY = parseInt(e.clientY, 10);

    for (var key in this.hud.elements) {
        if (this.hud.elements[key].contains(this.mouseX, this.mouseY) && this.hud.elements[key].clickable) {
            this.hud.elements[key].hovered = true;

            if (key == 'newGame') {
                this.status = 1;
                this.hud.elements[key].hide();
            }

            if (key == 'again_btn') {
                this.restart();
                for (var i = 0; i < this.players.length; i++) {
                    this.players[i].restart();
                }
            }

            if (key == 'pause_btn') {
                console.log('paused');
            }
        }
    }
};

BULANCI.Game.prototype.printDebugInfo = function() {
    this.context.fillStyle = 'rgba(0,0,0,0.6)';
    this.context.fontWeight = '100';
    this.context.font = '16px "Helvetica"';
    this.context.fillText('verze ' + BULANCI.VERSION, 20, 30);
    this.context.font = '12px "Helvetica"';

    var y = 60;
    this.context.fillText('stisknute klavesy:', 20, 45);

    for (var key in this.keys) {
        if (!this.keys.hasOwnProperty(key)) {
            continue;
        }

        this.context.fillText(key, 20, y);
        y += 15;
    }
};

BULANCI.Game.prototype.clearCanvas = function() {
    this.canvas.width = this.canvas.width;
};

BULANCI.Game.prototype.start = function() {
    this.remainingTime = this.defaultGametime;
    this.frameInterval = setInterval(this.update.bind(this), 1000 / this.fps);
    this.fpsInterval = setInterval(this.updateFPS.bind(this), 1000);
};

BULANCI.Game.prototype.restart = function() {
    this.remainingTime = this.defaultGametime;
    this.status = 1;
    this.activeBomb = null;
    this.floatingTaunts = [];
    this.splatterParticles = [];
    this.lastShootTapAt = [0, 0];
};

BULANCI.Game.prototype.setGametime = function(time) {
    localStorage.setItem('gametime', time);
};

BULANCI.Game.prototype.getGametime = function() {
    if (localStorage.getItem('gametime') === null) {
        localStorage.setItem('gametime', this.defaultGametime);
    }

    return localStorage.getItem('gametime');
};

BULANCI.Game.prototype.resourceLoaded = function() {
    if (++this.curLoadResNum == this.resources.length) {
        this.start();
    }
};

BULANCI.Game.prototype.loadImages = function() {
    for (var i = 0; i < this.resources.length; i++) {
        var name = this.resources[i];
        this.images[name] = new Image();
        this.images[name].addEventListener('load', this.resourceLoaded.bind(this), false);
        this.images[name].src = this.imagePath + name;
    }
};

BULANCI.Game.prototype.updateFPS = function() {
    this.curFPS = this.numFramesDrawn;
    this.numFramesDrawn = 0;

    if (this.status == 1 && this.remainingTime > 0) {
        this.remainingTime--;
    }
};

BULANCI.Game.prototype.keyBind = function() {
    var directions = {
        65: 1,
        87: 2,
        68: 3,
        83: 4,
        37: 1,
        38: 2,
        39: 3,
        40: 4
    };

    for (var i in this.keys) {
        if (!this.keys.hasOwnProperty(i)) {
            continue;
        }

        if (i >= 37 && i <= 40) {
            this.players[1].move(directions[i], this.canvas, this.elementList);
        }
        if (i == 65 || i == 68 || i == 83 || i == 87) {
            this.players[0].move(directions[i], this.canvas, this.elementList);
        }
    }
};

BULANCI.Game.prototype.keyboardPressed = function(e) {
    var event = e || window.event;
    var arrows = [37, 38, 39, 40];
    var wasd = [65, 68, 83, 87];
    var wasPressed = !!this.keys[event.keyCode];

    if (arrows.indexOf(event.keyCode) != -1) {
        delete this.keys[37];
        delete this.keys[38];
        delete this.keys[39];
        delete this.keys[40];
    }

    if (wasd.indexOf(event.keyCode) != -1) {
        delete this.keys[65];
        delete this.keys[68];
        delete this.keys[83];
        delete this.keys[87];
    }

    this.keys[event.keyCode] = event.type == 'keydown';

    if (event.type == 'keydown' && !wasPressed) {
        this.handleActionKeyPress(event.keyCode);
    }
};

BULANCI.Game.prototype.keyboardUnpressed = function(e) {
    var event = e || window.event;
    delete this.keys[event.keyCode];
};

BULANCI.Game.prototype.resize = function() {
    var newWidth = window.innerWidth || document.body.clientWidth;
    var newHeight = window.innerHeight || document.body.clientHeight;
    var xRatio = newWidth / this.width;
    var yRatio = newHeight / this.height;

    this.width = newWidth;
    this.height = newHeight;

    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);

    for (var i = 0; i < this.players.length; i++) {
        this.players[i].uniform(xRatio, yRatio);
    }

    if (this.activeBomb) {
        this.activeBomb.resize(xRatio, yRatio, this.width, this.height);
    }

    this.map.resize(this.width, this.height);

    var mapObstacles = this.map.getObstacles();
    for (var j = 0; j < this.players.length; j++) {
        this.players[j].setMapObstacles(mapObstacles);
    }

    this.rebuildElementList(mapObstacles);
};

BULANCI.Game.prototype.rebuildElementList = function(mapObstacles) {
    this.elementList = [];
    this.elementList = this.elementList.concat(this.players);
    this.elementList = this.elementList.concat(mapObstacles);
};

BULANCI.Game.prototype.getNearMissPhrase = function() {
    return this.nearMissPhrases[Math.floor(Math.random() * this.nearMissPhrases.length)];
};

BULANCI.Game.prototype.addFloatingTaunt = function(text, x, y, color) {
    this.floatingTaunts.push({
        text: text,
        x: x,
        y: y,
        opacity: 1,
        ttl: 34,
        color: color || '#f0e2a7'
    });
};

BULANCI.Game.prototype.updateFloatingTaunts = function() {
    for (var i = 0; i < this.floatingTaunts.length; i++) {
        this.floatingTaunts[i].ttl--;
        this.floatingTaunts[i].y -= 0.7;
        this.floatingTaunts[i].opacity = this.floatingTaunts[i].ttl / 34;

        if (this.floatingTaunts[i].ttl <= 0) {
            this.floatingTaunts.splice(i, 1);
            i--;
        }
    }
};

BULANCI.Game.prototype.drawFloatingTaunts = function() {
    for (var i = 0; i < this.floatingTaunts.length; i++) {
        var taunt = this.floatingTaunts[i];

        this.context.save();
        this.context.font = 'bold 22px "Helvetica"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillStyle = 'rgba(28, 20, 12, ' + Math.max(0, taunt.opacity * 0.75) + ')';
        this.context.fillText(taunt.text, taunt.x + 2, taunt.y + 2);
        this.context.fillStyle = taunt.color;
        this.context.globalAlpha = Math.max(0, taunt.opacity);
        this.context.fillText(taunt.text, taunt.x, taunt.y);
        this.context.restore();
    }
};

BULANCI.Game.prototype.handleActionKeyPress = function(keyCode) {
    if (keyCode === 32) {
        this.handleShootKeyPress(0);
    }

    if (keyCode === 13) {
        this.handleShootKeyPress(1);
    }
};

BULANCI.Game.prototype.handleShootKeyPress = function(playerIndex) {
    var now = Date.now();

    if (!this.players[playerIndex] || !this.players[playerIndex].isAlive) {
        return;
    }

    if (now - this.lastShootTapAt[playerIndex] <= this.doubleTapWindow && this.placeBomb(playerIndex)) {
        this.lastShootTapAt[playerIndex] = 0;
        return;
    }

    this.lastShootTapAt[playerIndex] = now;
    this.players[playerIndex].shoot();
};

BULANCI.Game.prototype.placeBomb = function(playerIndex) {
    var player = this.players[playerIndex];

    if (this.activeBomb || !player || !player.isAlive) {
        return false;
    }

    this.activeBomb = new BULANCI.Bomb(
        player.x + player.width / 2,
        player.y + player.height - 2,
        playerIndex,
        this.width,
        this.height
    );

    return true;
};

BULANCI.Game.prototype.processShootHits = function() {
    for (var i = 0; i < this.players.length; i++) {
        var shoots = this.players[i].getShoots();

        for (var s = 0; s < shoots.length; s++) {
            if (!shoots[s].getIsActive()) {
                continue;
            }

            for (var p = 0; p < this.players.length; p++) {
                if (p === i || !this.players[p].isAlive) {
                    continue;
                }

                if (this.players[p].isShootedBy(shoots[s].getX(), shoots[s].getY())) {
                    shoots[s].setIsActive(false);
                    this.killPlayer(p, i);
                    break;
                }

                if (!shoots[s].hasNearMissForTarget(p) && this.players[p].isNearMissBy(shoots[s].getX(), shoots[s].getY(), 30)) {
                    var taunt = this.getNearMissPhrase();

                    shoots[s].markNearMissForTarget(p);
                    this.addFloatingTaunt(
                        taunt,
                        this.players[p].x + this.players[p].width / 2,
                        this.players[p].y - 10,
                        this.players[p].getAccentColor()
                    );

                    if (BULANCI.Audio && BULANCI.Audio.playNearMissTaunt) {
                        BULANCI.Audio.playNearMissTaunt(taunt);
                    }
                }
            }
        }
    }
};

BULANCI.Game.prototype.updateBomb = function() {
    var hitCount = 0;

    if (!this.activeBomb) {
        return;
    }

    this.activeBomb.update(Date.now());

    if (this.activeBomb.isExploding() && !this.activeBomb.damageResolved) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].isAlive && this.activeBomb.hitsPlayer(this.players[i])) {
                if (this.killPlayer(i, this.activeBomb.ownerIndex, true)) {
                    hitCount++;
                }
            }
        }

        this.activeBomb.damageResolved = true;

        if (hitCount > 0) {
            if (BULANCI.Audio && BULANCI.Audio.stopTaunt) {
                BULANCI.Audio.stopTaunt();
            }

            if (BULANCI.Audio && BULANCI.Audio.playFlush) {
                BULANCI.Audio.playFlush();
            }
        }
    }

    if (this.activeBomb.isDone()) {
        this.activeBomb = null;
    }
};

BULANCI.Game.prototype.killPlayer = function(victimIndex, killerIndex, skipAudio) {
    var victim = this.players[victimIndex];

    if (!victim || !victim.isAlive) {
        return false;
    }

    if (typeof killerIndex === 'number' && killerIndex !== victimIndex) {
        this.players[killerIndex].setScore();
    }

    this.addSplatterBurst(
        victim.x + victim.width / 2,
        victim.y + victim.height / 2,
        victim.getBodyPalette(),
        victim.getAccentColor()
    );

    victim.death();
    victim.respawn(this.width, this.height, this.elementList);

    if (!skipAudio) {
        if (BULANCI.Audio && BULANCI.Audio.stopTaunt) {
            BULANCI.Audio.stopTaunt();
        }

        if (BULANCI.Audio && BULANCI.Audio.playFlush) {
            BULANCI.Audio.playFlush();
        }
    }

    return true;
};

BULANCI.Game.prototype.addSplatterBurst = function(x, y, palette, accent) {
    var colors = [palette.dark, palette.mid, palette.base, accent];

    for (var i = 0; i < 16; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 1.4 + Math.random() * 3.9;

        this.splatterParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - Math.random() * 1.2,
            radius: 3 + Math.random() * 5,
            ttl: 18 + Math.random() * 20,
            color: colors[i % colors.length]
        });
    }
};

BULANCI.Game.prototype.updateSplatterParticles = function() {
    for (var i = 0; i < this.splatterParticles.length; i++) {
        var particle = this.splatterParticles[i];

        particle.ttl--;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.12;
        particle.vx *= 0.96;

        if (particle.ttl <= 0) {
            this.splatterParticles.splice(i, 1);
            i--;
        }
    }
};

BULANCI.Game.prototype.drawSplatterParticles = function() {
    for (var i = 0; i < this.splatterParticles.length; i++) {
        var particle = this.splatterParticles[i];
        var alpha = Math.max(0, Math.min(1, particle.ttl / 30));

        this.context.save();
        this.context.globalAlpha = alpha;
        this.context.fillStyle = particle.color;
        this.context.beginPath();
        this.context.ellipse(particle.x, particle.y, particle.radius, particle.radius * 0.72, 0, 0, Math.PI * 2);
        this.context.fill();
        this.context.restore();
    }
};

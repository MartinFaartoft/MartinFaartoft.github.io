"use strict";
var Meteor = Entities.Meteor;
var Bullet = Entities.Bullet;
var Spaceship = Entities.Spaceship;
// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimationFrameShim = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
//create canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 50;
document.body.appendChild(canvas);
var lastTime = Date.now();
var two_pi = Math.PI * 2;
var frameNumber = 0;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    if (!isGameOver) {
        update(dt);
        render();
        lastTime = now;
        frameNumber++;
        requestAnimationFrameShim(main);
    }
    else {
        renderGameOver();
    }
}
//Game state
var player = new Spaceship([canvas.width / 2.0, canvas.height / 2.0]);
var debug = false;
var bullets = [];
var meteors = [];
var lastFire = Date.now();
var isGameOver = false;
//update
function update(dt) {
    handleInput(dt);
    updateEntities(dt);
    detectCollisions();
    garbageCollect();
}
;
//input
function handleInput(dt) {
    if (Input.isDown('UP')) {
        player.burn(dt);
    }
    if (Input.isDown('LEFT')) {
        player.rotateCounterClockWise(dt);
    }
    if (Input.isDown('RIGHT')) {
        player.rotateClockWise(dt);
    }
    if (Input.isDown('SPACE')) {
        if (player.canFire()) {
            var bullet = player.fire();
            bullets.push(bullet);
        }
    }
}
function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    renderMeteors();
    renderWrappedPlayers(player);
    renderBullets();
    if (debug) {
        ctx.fillStyle = 'white';
        ctx.fillRect(player.pos[0], player.pos[1], 3, 3);
        var gunPosition = player.gunPosition();
        ctx.fillRect(gunPosition[0], gunPosition[1], 3, 3);
        ctx.fillText("heading:" + player.heading, 10, 10);
    }
}
function renderGameOver() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = "80px comic sans";
    ctx.fillText("GAME OVER", canvas.height / 2.0, canvas.width / 2.0);
}
function renderMeteors() {
    for (var i = 0; i < meteors.length; i++) {
        renderWrappedMeteors(meteors[i]);
    }
}
function garbageCollect() {
    bullets = bullets.filter(function (b) { return !b.destroyed; });
    meteors = meteors.filter(function (m) { return !m.destroyed; });
}
function getWrappedEntityBoundingCircles(entity) {
    var boundingCircles = [entity];
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            boundingCircles.push({
                pos: [entity.pos[0] + i * canvas.width, entity.pos[1] + j * canvas.height],
                radius: entity.radius
            });
        }
    }
    return boundingCircles;
}
/**
 * render the actual player along with the 8 wrapped ones
 * can be optimized by inspecting actual coords and only rendering partially visible ones
 */
function renderWrappedPlayers(p) {
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            renderPlayer(p.pos[0] + i * canvas.width, p.pos[1] + j * canvas.height, p);
        }
    }
}
/**
 * render the actual meteor along with the 8 wrapped ones
 * can be optimized by inspecting actual coords and only rendering partially visible ones
 */
function renderWrappedMeteors(m) {
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            renderMeteor(m.pos[0] + i * canvas.width, m.pos[1] + j * canvas.height, m.radius);
        }
    }
}
function renderMeteor(x, y, r) {
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, two_pi, true);
    ctx.closePath();
    ctx.fill();
}
function renderBullets() {
    for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(b.pos[0], b.pos[1], b.radius, 0, two_pi, true);
        ctx.closePath();
        ctx.fill();
    }
}
function renderPlayer(x, y, player) {
    var scale = Spaceship.SCALE;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.heading);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 0);
    ctx.lineTo(2 * scale, 2 * scale);
    ctx.lineTo(scale, 0);
    ctx.lineTo(2 * scale, -2 * scale);
    ctx.fill();
    ctx.translate(x, y);
    ctx.restore();
}
function updateEntities(dt) {
    applyToEntities(function (e) { return e.update(dt); });
}
function applyToEntities(action) {
    action(player);
    for (var _i = 0, meteors_1 = meteors; _i < meteors_1.length; _i++) {
        var m = meteors_1[_i];
        action(m);
    }
    for (var _a = 0, bullets_1 = bullets; _a < bullets_1.length; _a++) {
        var b = bullets_1[_a];
        action(b);
    }
}
function gameOver() {
    isGameOver = true;
}
function detectCollisions() {
    //bullet meteor collision
    var newMeteors = [];
    for (var i = 0; i < bullets.length; i++) {
        for (var j = 0; j < meteors.length; j++) {
            if (detectCollisionWithWrapping(bullets[i], meteors[j])) {
                bullets[i].destroyed = true;
                meteors[j].destroyed = true;
                newMeteors = newMeteors.concat(meteors[j].explode());
            }
        }
    }
    meteors = meteors.concat(newMeteors);
    //player meteor collision
    for (var _i = 0, meteors_2 = meteors; _i < meteors_2.length; _i++) {
        var meteor = meteors_2[_i];
        if (detectCollisionWithWrapping(meteor, player)) {
        }
    }
    ;
}
function detectCollisionWithWrapping(a, b) {
    var wrappedEntities = getWrappedEntityBoundingCircles(b);
    for (var i = 0; i < wrappedEntities.length; i++) {
        if (detectCollision(a, wrappedEntities[i])) {
            return true;
        }
    }
    return false;
}
function detectCollision(a, b) {
    //circle collision
    var dx = a.pos[0] - b.pos[0];
    var dy = a.pos[1] - b.pos[1];
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}
function init() {
    meteors.push(new Meteor([canvas.width / 10, canvas.height / 5], [100, -50], 3));
    meteors.push(new Meteor([canvas.width * 7 / 10, canvas.height * 4 / 5], [-100, 100], 3));
    meteors.push(new Meteor([10, 10], [0, 0], 3));
}
init();
requestAnimationFrameShim(main);
//# sourceMappingURL=app.js.map
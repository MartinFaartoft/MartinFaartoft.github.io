"use strict";
var Meteor = Asteroids.Entities.Meteor;
var Bullet = Asteroids.Entities.Bullet;
var Spaceship = Asteroids.Entities.Spaceship;
var GameState = Asteroids.GameState;
var Engine = Asteroids.Engine;
//create canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 50;
document.body.appendChild(canvas);
var two_pi = Math.PI * 2;
var dimensions = [canvas.width, canvas.height];
var state = new GameState(dimensions);
var engine = new Engine(state, ctx);
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
function detectCollisions() {
    //bullet meteor collision
    var newMeteors = [];
    for (var i = 0; i < state.bullets.length; i++) {
        for (var j = 0; j < state.meteors.length; j++) {
            if (detectCollisionWithWrapping(state.bullets[i], state.meteors[j])) {
                state.bullets[i].destroyed = true;
                state.meteors[j].destroyed = true;
                newMeteors = newMeteors.concat(state.meteors[j].explode());
            }
        }
    }
    state.meteors = state.meteors.concat(newMeteors);
    //player meteor collision
    for (var _i = 0, _a = state.meteors; _i < _a.length; _i++) {
        var meteor = _a[_i];
        if (detectCollisionWithWrapping(meteor, state.spaceship)) {
            if (!engine.debug) {
                state.isGameOver = true;
            }
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
    state.meteors.push(new Meteor([canvas.width / 10, canvas.height / 5], [100, -50], 3));
    state.meteors.push(new Meteor([canvas.width * 7 / 10, canvas.height * 4 / 5], [-100, 100], 3));
    state.meteors.push(new Meteor([10, 10], [0, 0], 3));
}
init();
engine.run();
//# sourceMappingURL=app.js.map
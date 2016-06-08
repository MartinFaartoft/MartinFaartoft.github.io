"use strict";

import Meteor = Asteroids.Entities.Meteor;
import Bullet = Asteroids.Entities.Bullet;
import Spaceship = Asteroids.Entities.Spaceship;
import GameState = Asteroids.GameState;
import Engine = Asteroids.Engine;

// create canvas
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 50;
document.body.appendChild(canvas);

let two_pi = Math.PI * 2;

let dimensions = [canvas.width, canvas.height];
let state: GameState = new GameState(dimensions);
let engine: Engine = new Engine(state, ctx);

function getWrappedEntityBoundingCircles(entity) {
    let boundingCircles = [entity];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            boundingCircles.push({
                pos: [entity.pos[0] + i * canvas.width, entity.pos[1] + j * canvas.height],
                radius: entity.radius
            });
        }
    }
    return boundingCircles;
}

function detectCollisions() {
    // bullet meteor collision
    let newMeteors: Meteor[] = [];

    for (let i = 0; i < state.bullets.length; i++) {
        for (let j = 0; j < state.meteors.length; j++) {
            if (detectCollisionWithWrapping(state.bullets[i], state.meteors[j])) {
                state.bullets[i].destroyed = true;
                state.meteors[j].destroyed = true;

                newMeteors = newMeteors.concat(state.meteors[j].explode());
            }
        }
    }

    state.meteors = state.meteors.concat(newMeteors);

    // player meteor collision
    for (let meteor of state.meteors) {
        if (detectCollisionWithWrapping(meteor, state.spaceship)) {
            if (!engine.debug) {
                state.isGameOver = true;
            }
        }
    };
}

function detectCollisionWithWrapping(a, b) {
    let wrappedEntities = getWrappedEntityBoundingCircles(b);
    for (let i = 0; i < wrappedEntities.length; i++) {
        if (detectCollision(a, wrappedEntities[i])) {
            return true;
        }
    }

    return false;
}

function detectCollision(a, b) {
    // circle collision
    let dx = a.pos[0] - b.pos[0];
    let dy = a.pos[1] - b.pos[1];

    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}

 function init() {
    state.meteors.push(new Meteor([canvas.width / 10, canvas.height / 5], [100, -50], 3));
    state.meteors.push(new Meteor([canvas.width * 7 / 10, canvas.height * 4 / 5], [-100, 100], 3));
    state.meteors.push(new Meteor([10, 10], [0, 0], 3));
}

init();
engine.run();
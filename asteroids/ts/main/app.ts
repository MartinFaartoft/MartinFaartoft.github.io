"use strict";

import Meteor = Asteroids.Entities.Meteor;
import GameState = Asteroids.GameState;
import Engine = Framework.Engine;

// create canvas
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 50;
document.body.appendChild(canvas);

// prepare game state and engine
let debug = false;
let dimensions = [canvas.width, canvas.height];
let resourceManager: Framework.ResourceManager = new Framework.ResourceManager();
let state: GameState = new GameState(dimensions, resourceManager, debug);
let engine: Engine = new Engine(state, ctx, debug);


function init() {
    state.meteors.push(new Meteor([canvas.width / 10, canvas.height / 5], [100, -50], 3));
    state.meteors.push(new Meteor([canvas.width * 7 / 10, canvas.height * 4 / 5], [-100, 100], 3));
    state.meteors.push(new Meteor([10, 10], [0, 0], 3));
}

init();

// load resources and start game when ready
resourceManager.onReady(() => engine.run());
resourceManager.preload(["assets/spaceship.png", "assets/meteor.png", "assets/burn.png", "assets/explosion.png"]);
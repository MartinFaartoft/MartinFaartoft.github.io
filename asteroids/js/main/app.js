"use strict";
var Meteor = Asteroids.Entities.Meteor;
var GameState = Asteroids.GameState;
var Engine = Framework.Engine;
// create canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 50;
document.body.appendChild(canvas);
// prepare game state and engine
var debug = false;
var dimensions = [canvas.width, canvas.height];
var resourceManager = new Framework.ResourceManager();
var state = new GameState(dimensions, resourceManager, debug);
var engine = new Engine(state, ctx, debug);
function init() {
    state.meteors.push(new Meteor([canvas.width / 10, canvas.height / 5], [100, -50], 3));
    state.meteors.push(new Meteor([canvas.width * 7 / 10, canvas.height * 4 / 5], [-100, 100], 3));
    state.meteors.push(new Meteor([10, 10], [0, 0], 3));
}
init();
// load resources and start game when ready
resourceManager.onReady(function () { return engine.run(); });
resourceManager.preload(["assets/spaceship.png"]);
//# sourceMappingURL=app.js.map
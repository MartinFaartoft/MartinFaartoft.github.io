"use strict";
var Asteroids;
(function (Asteroids) {
    var GameState = (function () {
        function GameState(dimensions) {
            this.dimensions = dimensions;
            this.meteors = [];
            this.bullets = [];
            this.isGameOver = false;
            this.spaceship = new Spaceship([dimensions[0] / 2.0, dimensions[1] / 2.0]);
        }
        GameState.prototype.garbageCollect = function () {
            this.bullets = this.bullets.filter(function (b) { return !b.destroyed; });
            this.meteors = this.meteors.filter(function (m) { return !m.destroyed; });
        };
        GameState.prototype.applyToEntities = function (action) {
            action(state.spaceship);
            for (var _i = 0, _a = state.meteors; _i < _a.length; _i++) {
                var m = _a[_i];
                action(m);
            }
            for (var _b = 0, _c = state.bullets; _b < _c.length; _b++) {
                var b = _c[_b];
                action(b);
            }
        };
        GameState.prototype.handleInput = function (dt) {
            if (Input.isDown('UP')) {
                state.spaceship.burn(dt);
            }
            if (Input.isDown('LEFT')) {
                state.spaceship.rotateCounterClockWise(dt);
            }
            if (Input.isDown('RIGHT')) {
                state.spaceship.rotateClockWise(dt);
            }
            if (Input.isDown('SPACE')) {
                state.spaceship.fire(this);
            }
        };
        return GameState;
    }());
    Asteroids.GameState = GameState;
})(Asteroids || (Asteroids = {}));
//# sourceMappingURL=gamestate.js.map
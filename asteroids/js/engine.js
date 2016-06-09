"use strict";
var Entity = Asteroids.Entities.Entity;
var Asteroids;
(function (Asteroids) {
    var Engine = (function () {
        function Engine(state, ctx) {
            this.state = state;
            this.ctx = ctx;
            this.lastTime = Date.now();
            this.debug = false;
            // A cross-browser requestAnimationFrame
            // See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
            this.requestAnimationFrameShim = (function () {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) {
                        window.setTimeout(callback, 1000 / 60);
                    };
            })();
        }
        Engine.prototype.run = function () {
            var now = Date.now();
            var dt = (now - this.lastTime) / 1000.0;
            //if (!state.isGameOver) {
            this.update(dt);
            this.render();
            this.lastTime = now;
            this.requestAnimationFrameShim.call(window, this.run.bind(this));
            //}
            // else {
            //     this.renderGameOver();
            // }
        };
        Engine.prototype.update = function (dt) {
            state.handleInput(dt);
            state.update(dt);
            state.detectCollisions();
            state.garbageCollect();
        };
        Engine.prototype.render = function () {
            state.applyToEntities(function (e) { return e.render(ctx, state); });
            if (this.debug) {
                ctx.fillStyle = "white";
                ctx.fillRect(state.spaceship.pos[0], state.spaceship.pos[1], 3, 3);
                // var gunPosition = state.spaceship.gunPosition();
                // ctx.fillRect(gunPosition[0], gunPosition[1], 3, 3);
                ctx.fillText("heading:" + state.spaceship.heading, 10, 10);
            }
        };
        return Engine;
    }());
    Asteroids.Engine = Engine;
})(Asteroids || (Asteroids = {}));
//# sourceMappingURL=engine.js.map
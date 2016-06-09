"use strict";
var Asteroids;
(function (Asteroids) {
    var Background = Asteroids.Entities.Background;
    var GameOverScreen = Asteroids.Entities.GameOverScreen;
    var Spaceship = Asteroids.Entities.Spaceship;
    var DebugDisplay = Asteroids.Entities.DebugDisplay;
    var GameState = (function () {
        function GameState(dimensions, resourceManager, debug) {
            this.dimensions = dimensions;
            this.resourceManager = resourceManager;
            this.debug = debug;
            this.background = new Background();
            this.gameOverScreen = new GameOverScreen();
            this.debugDisplay = new DebugDisplay();
            this.meteors = [];
            this.bullets = [];
            this.explosions = [];
            this.isGameOver = false;
            this.spaceship = new Spaceship([dimensions[0] / 2.0, dimensions[1] / 2.0]);
        }
        GameState.prototype.garbageCollect = function () {
            this.bullets = this.bullets.filter(function (b) { return !b.destroyed; });
            this.meteors = this.meteors.filter(function (m) { return !m.destroyed; });
            this.explosions = this.explosions.filter(function (e) { return !e.destroyed; });
        };
        GameState.prototype.update = function (dt) {
            var _this = this;
            this.handleInput(dt);
            this.applyToEntities(function (e) { return e.update(dt, _this); });
            this.detectCollisions();
            this.garbageCollect();
        };
        GameState.prototype.render = function (ctx) {
            var _this = this;
            this.applyToEntities(function (e) { return e.render(ctx, _this); });
        };
        GameState.prototype.applyToEntities = function (action) {
            action(this.background);
            action(this.spaceship);
            for (var _i = 0, _a = this.explosions; _i < _a.length; _i++) {
                var e = _a[_i];
                action(e);
            }
            for (var _b = 0, _c = this.meteors; _b < _c.length; _b++) {
                var m = _c[_b];
                action(m);
            }
            for (var _d = 0, _e = this.bullets; _d < _e.length; _d++) {
                var b = _e[_d];
                action(b);
            }
            action(this.gameOverScreen);
            action(this.debugDisplay);
        };
        GameState.prototype.handleInput = function (dt) {
            if (!this.isGameOver) {
                if (Framework.isKeyDown("UP")) {
                    this.spaceship.burn(dt);
                }
                else {
                    this.spaceship.stopBurn();
                }
                if (Framework.isKeyDown("LEFT")) {
                    this.spaceship.rotateCounterClockWise(dt);
                }
                if (Framework.isKeyDown("RIGHT")) {
                    this.spaceship.rotateClockWise(dt);
                }
                if (Framework.isKeyDown("SPACE")) {
                    this.spaceship.fire(this);
                }
            }
        };
        GameState.prototype.detectCollisions = function () {
            // bullet meteor collision
            for (var _i = 0, _a = this.bullets; _i < _a.length; _i++) {
                var bullet = _a[_i];
                for (var _b = 0, _c = this.meteors; _b < _c.length; _b++) {
                    var meteor = _c[_b];
                    if (this.detectCollisionWithWrapping(bullet, meteor)) {
                        bullet.collideWith(meteor, this);
                        meteor.collideWith(bullet, this);
                    }
                }
            }
            // player meteor collision
            for (var _d = 0, _e = this.meteors; _d < _e.length; _d++) {
                var meteor = _e[_d];
                if (this.detectCollisionWithWrapping(meteor, this.spaceship)) {
                    this.spaceship.collideWith(meteor, this);
                    meteor.collideWith(this.spaceship, this);
                }
            }
            ;
        };
        GameState.prototype.detectCollisionWithWrapping = function (a, b) {
            var wrappedEntities = b.getWrappedBoundingCircles(this.dimensions);
            for (var i = 0; i < wrappedEntities.length; i++) {
                if (this.detectCollision(a, wrappedEntities[i])) {
                    return true;
                }
            }
            return false;
        };
        GameState.prototype.detectCollision = function (a, b) {
            // circle collision
            var dx = a.pos[0] - b.pos[0];
            var dy = a.pos[1] - b.pos[1];
            var distance = Math.sqrt(dx * dx + dy * dy);
            return distance < a.radius + b.radius;
        };
        return GameState;
    }());
    Asteroids.GameState = GameState;
})(Asteroids || (Asteroids = {}));
//# sourceMappingURL=gamestate.js.map
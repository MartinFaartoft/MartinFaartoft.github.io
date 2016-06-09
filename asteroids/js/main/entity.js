"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Asteroids;
(function (Asteroids) {
    var Entities;
    (function (Entities) {
        var Entity = (function () {
            function Entity(pos, speed, radius) {
                this.pos = pos;
                this.speed = speed;
                this.radius = radius;
                this.destroyed = false;
            }
            Entity.prototype.update = function (dt, dimensions) {
                this.pos[0] += this.speed[0] * dt;
                this.pos[1] += this.speed[1] * dt;
                this.wrap(dimensions);
            };
            Entity.prototype.wrap = function (dimensions) {
                // exit right edge
                if (this.pos[0] > dimensions[0]) {
                    this.pos[0] -= dimensions[0];
                }
                // exit left edge
                if (this.pos[0] < 0) {
                    this.pos[0] += dimensions[0];
                }
                // exit top
                if (this.pos[1] < 0) {
                    this.pos[1] += dimensions[1];
                }
                // exit bottom
                if (this.pos[1] > dimensions[1]) {
                    this.pos[1] -= dimensions[1];
                }
            };
            Entity.prototype.getWrappedBoundingCircles = function (dimensions) {
                var boundingCircles = [this];
                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        boundingCircles.push({
                            pos: [this.pos[0] + i * dimensions[0], this.pos[1] + j * dimensions[1]],
                            radius: this.radius,
                            entity: this
                        });
                    }
                }
                return boundingCircles;
            };
            return Entity;
        }());
        Entities.Entity = Entity;
        var Meteor = (function (_super) {
            __extends(Meteor, _super);
            function Meteor(pos, speed, size) {
                _super.call(this, pos, speed, size * Meteor.SCALING_FACTOR);
                this.size = size;
            }
            Meteor.prototype.explode = function () {
                if (this.size === 1) {
                    return [];
                }
                var meteors = [];
                for (var i = 0; i < Meteor.SPLIT_FACTOR; i++) {
                    var initialSpeed = Math.random() * Meteor.POST_EXPLOSION_MAX_SPEED;
                    var direction = Math.random() * Math.PI * 2;
                    var pos = [this.pos[0], this.pos[1]];
                    var speed = [initialSpeed * Math.cos(direction), initialSpeed * Math.sin(direction)];
                    meteors.push(new Meteor(pos, speed, this.size - 1));
                }
                return meteors;
            };
            Meteor.prototype.collideWith = function (other, state) {
                if (other instanceof Bullet) {
                    this.destroyed = true;
                    for (var _i = 0, _a = this.explode(); _i < _a.length; _i++) {
                        var meteor = _a[_i];
                        state.meteors.push(meteor);
                    }
                }
            };
            Meteor.prototype.render = function (ctx, state) {
                for (var _i = 0, _a = this.getWrappedBoundingCircles(dimensions); _i < _a.length; _i++) {
                    var bc = _a[_i];
                    this.renderInternal(ctx, bc.pos[0], bc.pos[1], bc.radius);
                }
            };
            Meteor.prototype.renderInternal = function (ctx, x, y, radius) {
                ctx.fillStyle = "orange";
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            };
            Meteor.SCALING_FACTOR = 30;
            Meteor.SPLIT_FACTOR = 3;
            Meteor.POST_EXPLOSION_MAX_SPEED = 200;
            return Meteor;
        }(Entity));
        Entities.Meteor = Meteor;
        var Bullet = (function (_super) {
            __extends(Bullet, _super);
            function Bullet(pos, speed) {
                _super.call(this, pos, speed, Bullet.RADIUS);
                this.age = 0; // seconds
            }
            Bullet.prototype.update = function (dt, dimensions) {
                _super.prototype.update.call(this, dt, dimensions);
                this.age += dt;
                if (this.age > Bullet.LIFESPAN) {
                    this.destroyed = true;
                }
            };
            Bullet.prototype.collideWith = function (other, state) {
                if (other instanceof Meteor) {
                    this.destroyed = true;
                }
            };
            Bullet.prototype.render = function (ctx) {
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            };
            Bullet.RADIUS = 5; // pixels
            Bullet.LIFESPAN = 1; // seconds
            return Bullet;
        }(Entity));
        Entities.Bullet = Bullet;
        var Spaceship = (function (_super) {
            __extends(Spaceship, _super);
            function Spaceship(pos) {
                _super.call(this, pos, [0, 0], Spaceship.SPRITE_RADIUS * Spaceship.SCALE);
                this.heading = Math.PI / 2.0; // facing north by default
                this.rotation_speed = 150 * Math.PI / 180.0;
                this.acceleration = 300;
                this.timeSinceLastFiring = Spaceship.SHOT_DELAY; // seconds
            }
            Spaceship.prototype.update = function (dt, dimensions) {
                _super.prototype.update.call(this, dt, dimensions);
                this.timeSinceLastFiring += dt;
            };
            Spaceship.prototype.burn = function (dt) {
                var d_x = Math.cos(this.heading);
                var d_y = Math.sin(this.heading);
                this.speed[0] -= d_x * this.acceleration * dt;
                this.speed[1] -= d_y * this.acceleration * dt;
            };
            Spaceship.prototype.gunPosition = function () {
                return [this.pos[0] - Math.cos(this.heading) * this.radius,
                    this.pos[1] - Math.sin(this.heading) * this.radius];
            };
            Spaceship.prototype.canFire = function () {
                return this.timeSinceLastFiring >= Spaceship.SHOT_DELAY;
            };
            Spaceship.prototype.fire = function (state) {
                if (this.canFire()) {
                    console.log('fired');
                    var gunPos = this.gunPosition();
                    var speed_x = this.speed[0] - Math.cos(this.heading) * 8 * 60;
                    var speed_y = this.speed[1] - Math.sin(this.heading) * 8 * 60;
                    this.timeSinceLastFiring = 0;
                    state.bullets.push(new Bullet([gunPos[0], gunPos[1]], [speed_x, speed_y]));
                }
            };
            Spaceship.prototype.rotateClockWise = function (dt) {
                this.heading += this.rotation_speed * dt;
                this.heading = this.heading % (Math.PI * 2);
            };
            Spaceship.prototype.rotateCounterClockWise = function (dt) {
                this.heading -= this.rotation_speed * dt;
                this.heading = this.heading % (Math.PI * 2);
            };
            Spaceship.prototype.collideWith = function (other, state) {
                if (other instanceof Meteor) {
                    this.destroyed = true;
                    state.isGameOver = true;
                }
            };
            Spaceship.prototype.render = function (ctx, state) {
                for (var _i = 0, _a = this.getWrappedBoundingCircles(state.dimensions); _i < _a.length; _i++) {
                    var bc = _a[_i];
                    this.renderInternal(ctx, bc.pos[0], bc.pos[1], this.heading);
                }
            };
            Spaceship.prototype.renderInternal = function (ctx, x, y, heading) {
                var scale = Spaceship.SCALE;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(heading);
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.moveTo(-2 * scale, 0);
                ctx.lineTo(2 * scale, 2 * scale);
                ctx.lineTo(scale, 0);
                ctx.lineTo(2 * scale, -2 * scale);
                ctx.fill();
                ctx.translate(x, y);
                ctx.restore();
            };
            Spaceship.SCALE = 15;
            Spaceship.SPRITE_RADIUS = 2;
            Spaceship.SHOT_DELAY = .1; // seconds
            return Spaceship;
        }(Entity));
        Entities.Spaceship = Spaceship;
        var Background = (function (_super) {
            __extends(Background, _super);
            function Background() {
                _super.call(this, [0, 0], [0, 0], 0);
            }
            Background.prototype.render = function (ctx, state) {
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, state.dimensions[0], state.dimensions[1]);
            };
            Background.prototype.update = function (dt, dimensions) {
                // intentionally left blank
            };
            return Background;
        }(Entity));
        Entities.Background = Background;
        var GameOverScreen = (function (_super) {
            __extends(GameOverScreen, _super);
            function GameOverScreen() {
                _super.call(this, [0, 0], [0, 0], 0);
            }
            GameOverScreen.prototype.render = function (ctx, state) {
                if (state.isGameOver) {
                    ctx.fillStyle = "red";
                    ctx.font = "80px comic sans";
                    var textWidth = ctx.measureText("GAME OVER").width;
                    ctx.fillText("GAME OVER", (state.dimensions[0] - textWidth) / 2.0, state.dimensions[1] / 2.0);
                }
            };
            GameOverScreen.prototype.update = function (dt, dimensions) {
                // intentionally left blank
            };
            return GameOverScreen;
        }(Entity));
        Entities.GameOverScreen = GameOverScreen;
        var DebugDisplay = (function (_super) {
            __extends(DebugDisplay, _super);
            function DebugDisplay() {
                _super.call(this, [0, 0], [0, 0], 0);
            }
            DebugDisplay.prototype.render = function (ctx, state) {
                if (state.debug) {
                    ctx.fillStyle = "white";
                    ctx.font = "20px Arial";
                    ctx.fillText("player: ", 10, 20);
                    ctx.fillText("heading: " + this.roundToTwo(state.spaceship.heading), 20, 40);
                    ctx.fillText("pos_x: " + this.roundToTwo(state.spaceship.pos[0]), 20, 60);
                    ctx.fillText("pos_y: " + this.roundToTwo(state.spaceship.pos[1]), 20, 80);
                }
            };
            DebugDisplay.prototype.roundToTwo = function (num) {
                return Math.round(num * 100) / 100;
            };
            return DebugDisplay;
        }(Entity));
        Entities.DebugDisplay = DebugDisplay;
    })(Entities = Asteroids.Entities || (Asteroids.Entities = {}));
})(Asteroids || (Asteroids = {}));
//# sourceMappingURL=entity.js.map
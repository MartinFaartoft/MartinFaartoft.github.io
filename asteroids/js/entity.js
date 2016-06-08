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
            Entity.prototype.update = function (dt) {
                this.pos[0] += this.speed[0] * dt;
                this.pos[1] += this.speed[1] * dt;
                this.wrap();
            };
            Entity.prototype.wrap = function () {
                //exit right edge
                if (this.pos[0] > canvas.width) {
                    this.pos[0] = 0;
                }
                //exit left edge
                if (this.pos[0] < 0) {
                    this.pos[0] = canvas.width;
                }
                //exit top
                if (this.pos[1] < 0) {
                    this.pos[1] = canvas.height;
                }
                //exit bottom
                if (this.pos[1] > canvas.height) {
                    this.pos[1] = 0;
                }
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
            Meteor.prototype.render = function (ctx) {
                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        this.renderInternal(ctx, this.pos[0] + i * dimensions[0], this.pos[1] + j * dimensions[1], this.radius);
                    }
                }
            };
            Meteor.prototype.renderInternal = function (ctx, x, y, radius) {
                ctx.fillStyle = 'grey';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, two_pi, true);
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
            function Bullet(pos, speed, endTime) {
                _super.call(this, pos, speed, Bullet.RADIUS);
                this.endTime = endTime;
            }
            Bullet.prototype.update = function (dt) {
                _super.prototype.update.call(this, dt);
                if (this.endTime < Date.now()) {
                    this.destroyed = true;
                }
            };
            Bullet.prototype.render = function (ctx) {
                ctx.fillStyle = 'green';
                ctx.beginPath();
                ctx.arc(this.pos[0], this.pos[1], this.radius, 0, two_pi, true);
                ctx.closePath();
                ctx.fill();
            };
            Bullet.RADIUS = 5;
            return Bullet;
        }(Entity));
        Entities.Bullet = Bullet;
        var Spaceship = (function (_super) {
            __extends(Spaceship, _super);
            function Spaceship(pos) {
                _super.call(this, pos, [0, 0], Spaceship.SPRITE_RADIUS * Spaceship.SCALE);
                this.heading = Math.PI / 2.0; //facing north by default
                this.rotation_speed = 150 * Math.PI / 180.0;
                this.acceleration = 300;
                this.lastFire = 0;
            }
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
                return this.lastFire < Date.now() - Spaceship.SHOT_DELAY;
            };
            Spaceship.prototype.fire = function (state) {
                if (this.canFire()) {
                    var gunPos = this.gunPosition();
                    var speed_x = this.speed[0] - Math.cos(this.heading) * 8 * 60;
                    var speed_y = this.speed[1] - Math.sin(this.heading) * 8 * 60;
                    this.lastFire = Date.now();
                    state.bullets.push(new Bullet([gunPos[0], gunPos[1]], [speed_x, speed_y], Date.now() + 1000));
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
            Spaceship.prototype.render = function (ctx, dimensions) {
                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        this.renderInternal(ctx, this.pos[0] + i * dimensions[0], this.pos[1] + j * dimensions[1], this.heading);
                    }
                }
            };
            Spaceship.prototype.renderInternal = function (ctx, x, y, heading) {
                var scale = Spaceship.SCALE;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(heading);
                ctx.fillStyle = 'red';
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
            Spaceship.SHOT_DELAY = 100;
            return Spaceship;
        }(Entity));
        Entities.Spaceship = Spaceship;
    })(Entities = Asteroids.Entities || (Asteroids.Entities = {}));
})(Asteroids || (Asteroids = {}));
//# sourceMappingURL=entity.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Entities;
(function (Entities) {
    var Entity = (function () {
        function Entity(pos, speed, radius) {
            this.pos = pos;
            this.speed = speed;
            this.radius = radius;
        }
        Entity.prototype.advance = function (dt) {
            this.pos[0] += this.speed[0] * dt;
            this.pos[1] += this.speed[1] * dt;
        };
        return Entity;
    }());
    Entities.Entity = Entity;
    var Meteor = (function (_super) {
        __extends(Meteor, _super);
        function Meteor(pos, speed, size) {
            _super.call(this, pos, speed, size * Meteor.SCALING_FACTOR);
            this.size = size;
            this.exploded = false;
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
        Spaceship.prototype.fire = function () {
            if (this.canFire()) {
                var gunPos = this.gunPosition();
                var speed_x = this.speed[0] - Math.cos(this.heading) * 8 * 60;
                var speed_y = this.speed[1] - Math.sin(this.heading) * 8 * 60;
                this.lastFire = Date.now();
                return new Bullet([gunPos[0], gunPos[1]], [speed_x, speed_y], Date.now() + 1000);
            }
            Error('asked to shoot before cooldown was over');
        };
        Spaceship.prototype.rotateClockWise = function (dt) {
            this.heading += this.rotation_speed * dt;
            this.heading = this.heading % (Math.PI * 2);
        };
        Spaceship.prototype.rotateCounterClockWise = function (dt) {
            this.heading -= this.rotation_speed * dt;
            this.heading = this.heading % (Math.PI * 2);
        };
        Spaceship.SCALE = 15;
        Spaceship.SPRITE_RADIUS = 2;
        Spaceship.SHOT_DELAY = 100;
        return Spaceship;
    }(Entity));
    Entities.Spaceship = Spaceship;
})(Entities || (Entities = {}));
//# sourceMappingURL=entity.js.map
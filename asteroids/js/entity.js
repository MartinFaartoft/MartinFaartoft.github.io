var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Entity = (function () {
    function Entity(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
    Entity.prototype.advance = function (dt) {
        this.pos[0] += this.speed[0] * dt;
        this.pos[1] += this.speed[1] * dt;
    };
    return Entity;
}());
var Meteor = (function (_super) {
    __extends(Meteor, _super);
    function Meteor(pos, speed, size) {
        _super.call(this, pos, speed);
        this.pos = pos;
        this.speed = speed;
        this.size = size;
        this.exploded = false;
        this.radius = size * Meteor.SCALING_FACTOR;
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
//# sourceMappingURL=entity.js.map
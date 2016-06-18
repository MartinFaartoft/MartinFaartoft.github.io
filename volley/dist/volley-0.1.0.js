var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="piston-0.1.1.d.ts" />
/// <reference path="volleystate.ts" />
var volley;
(function (volley) {
    var Ball = (function (_super) {
        __extends(Ball, _super);
        function Ball(pos, speed, accel, radius) {
            _super.call(this, pos, speed, radius);
            this.pos = pos;
            this.speed = speed;
            this.accel = accel;
            this.friction = [0.0001, .001];
            this.collided = 0;
        }
        Ball.prototype.render = function (ctx, state) {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
            ctx.fill();
        };
        Ball.prototype.update = function (dt, state) {
            this.checkWallCollisions(state);
            this.checkNetCollision(state);
            if (this.collided > 0) {
                this.collided -= dt;
            }
            this.accelerate(dt);
        };
        Ball.prototype.accelerate = function (dt) {
            this.speed[0] += this.accel[0] * dt;
            this.speed[1] += this.accel[1] * dt;
            //apply friction
            this.speed[0] *= 1 - this.friction[0];
            this.speed[1] *= 1 - this.friction[1];
            this.pos[0] += this.speed[0] * dt;
            this.pos[1] += this.speed[1] * dt;
        };
        Ball.prototype.checkNetCollision = function (state) {
            if (this.collided > 0) {
                return;
            }
            var netX = state.net.pos[0];
            var netY = state.net.pos[1] - volley.Net.HEIGHT;
            var xOverlap = this.pos[0] > netX - this.radius && this.pos[0] < netX + this.radius + volley.Net.THICKNESS;
            var yOverlap = this.pos[1] > netY - this.radius + 20 && this.pos[1] < state.net.pos[1];
            if (xOverlap && yOverlap) {
                this.speed[0] *= -1;
                this.collided = .1;
            }
        };
        Ball.prototype.checkWallCollisions = function (state) {
            //if overlapping floor and moving down
            if (this.pos[1] + this.radius >= state.dimensions[1] && this.speed[1] > 0) {
                this.speed[1] *= -1;
            } //if overlapping ceiling and moving up 
            else if (this.pos[1] - this.radius < 0 && this.speed[1] < 0) {
                this.speed[1] *= -1;
            }
            //if overlapping left wall and moving left
            if (this.pos[0] - this.radius < 0 && this.speed[0] < 0) {
                this.speed[0] *= -1;
            } //if overlapping right wall and moving right
            else if (this.pos[0] + this.radius > state.dimensions[0] && this.speed[0] > 0) {
                this.speed[0] *= -1;
            }
        };
        //http://vobarian.com/collisions/2dcollisions2.pdf
        Ball.prototype.collideWith = function (other) {
            if (this.collided > 0) {
                return; //already handled
            }
            this.collided = .1;
            var m0 = 25, m1 = 100; //masses
            var x0 = this.pos[0];
            var y0 = this.pos[1];
            var x1 = other.pos[0];
            var y1 = other.pos[1];
            //1: find unit normal and unit tangent vectors
            var normal = [x1 - x0, y1 - y0];
            var normal_magnitude = this.magnitude(normal);
            var unit_normal = [
                normal[0] / normal_magnitude,
                normal[1] / normal_magnitude
            ];
            var unit_tangent = [-unit_normal[1], unit_normal[0]];
            //2: create initial velocity vectors
            var v0 = [this.speed[0], this.speed[1]];
            var v1 = [other.speed[0], other.speed[1]];
            //3: calculate scalar velocities in the normal and tangential direction for both
            var scalar_v0_n = this.dotProduct(unit_normal, v0);
            var scalar_v0_t = this.dotProduct(unit_tangent, v0);
            var scalar_v1_n = this.dotProduct(unit_normal, v1);
            var scalar_v1_t = this.dotProduct(unit_tangent, v1);
            //4: find the new tangential velocities after collisions
            var post_scalar_v0_t = scalar_v0_t;
            var post_scalar_v1_t = scalar_v1_t;
            //5: find new normal velocities
            var post_scalar_v0_n = this.calculateNormalVelocity(scalar_v0_n, scalar_v1_n, m0, m1);
            var post_scalar_v1_n = this.calculateNormalVelocity(scalar_v1_n, scalar_v0_n, m1, m0);
            //6: convert scalar normal and tangential velocities into vectors
            var post_v0_n = [post_scalar_v0_n * unit_normal[0], post_scalar_v0_n * unit_normal[1]];
            var post_v1_n = [post_scalar_v1_n * unit_normal[0], post_scalar_v1_n * unit_normal[1]];
            var post_v0_t = [post_scalar_v0_t * unit_tangent[0], post_scalar_v0_t * unit_tangent[1]];
            var post_v1_t = [post_scalar_v1_t * unit_tangent[0], post_scalar_v1_t * unit_tangent[1]];
            //7: find final velocity vectors by adding normal and tangential components
            var post_v0 = this.add(post_v0_n, post_v0_t);
            var post_v1 = this.add(post_v1_n, post_v1_t);
            this.speed = [post_v0[0], post_v0[1]];
        };
        Ball.prototype.add = function (a, b) {
            return [a[0] + b[0], a[1] + b[1]];
        };
        Ball.prototype.magnitude = function (v) {
            return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
        };
        Ball.prototype.dotProduct = function (a, b) {
            return a[0] * b[0] + a[1] * b[1];
        };
        Ball.prototype.calculateNormalVelocity = function (v1n, v2n, m1, m2) {
            return (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
        };
        return Ball;
    }(ps.Entity));
    volley.Ball = Ball;
})(volley || (volley = {}));
/// <reference path="piston-0.1.1.d.ts" />
var volley;
(function (volley) {
    (function (PlayerDirection) {
        PlayerDirection[PlayerDirection["Left"] = 0] = "Left";
        PlayerDirection[PlayerDirection["Right"] = 1] = "Right";
    })(volley.PlayerDirection || (volley.PlayerDirection = {}));
    var PlayerDirection = volley.PlayerDirection;
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(pos, color, radius, keys, direction) {
            _super.call(this, pos, [0, 0], radius);
            this.color = color;
            this.keys = keys;
            this.direction = direction;
            this.accel = [0, 900];
            this.isJumping = false;
        }
        Player.prototype.render = function (ctx, state) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI, true);
            ctx.fill();
            this.renderEye(ctx);
        };
        Player.prototype.renderEye = function (ctx) {
            var eyeX = this.pos[0] + ((this.radius / 2.0) * (this.direction === PlayerDirection.Right ? -1 : 1));
            var eyeY = this.pos[1] - this.radius / 2.0;
            var pupilX = eyeX + 2 * (this.direction === PlayerDirection.Right ? -1 : 1);
            var pupilY = eyeY;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(pupilX, eyeY, 2, 0, Math.PI * 2);
            ctx.fill();
        };
        Player.prototype.update = function (dt, state) {
            if (this.isJumping) {
                if (this.pos[1] < state.dimensions[1]) {
                    this.accelerate(dt);
                }
                else {
                    this.speed[1] = 0;
                    this.pos[1] = state.dimensions[1];
                    this.isJumping = false;
                }
            }
            this.pos[0] += this.speed[0] * dt;
            this.pos[1] += this.speed[1] * dt;
        };
        Player.prototype.accelerate = function (dt) {
            this.speed[0] += this.accel[0] * dt;
            this.speed[1] += this.accel[1] * dt;
        };
        Player.prototype.collideWith = function (other) { };
        Player.prototype.handleInput = function () {
            this.speed[0] = 0;
            if (ps.isKeyDown(this.keys[0])) {
                this.speed[0] = -300;
            }
            else if (ps.isKeyDown(this.keys[1])) {
                this.speed[0] = 300;
            }
            if (ps.isKeyDown(this.keys[2])) {
                if (!this.isJumping) {
                    this.isJumping = true;
                    this.speed[1] = -300;
                    this.pos[1] -= 1;
                }
            }
        };
        return Player;
    }(ps.Entity));
    volley.Player = Player;
})(volley || (volley = {}));
/// <reference path="piston-0.1.1.d.ts" />
var volley;
(function (volley) {
    var Net = (function (_super) {
        __extends(Net, _super);
        function Net() {
            _super.call(this, [1024 / 2.0, 768], [0, 0], 0);
        }
        Net.prototype.render = function (ctx) {
            ctx.fillStyle = "purple";
            ctx.fillRect(this.pos[0], this.pos[1], Net.THICKNESS, -Net.HEIGHT);
        };
        Net.HEIGHT = 300;
        Net.THICKNESS = 10;
        return Net;
    }(ps.Entity));
    volley.Net = Net;
})(volley || (volley = {}));
/// <reference path="piston-0.1.1.d.ts" />
var volley;
(function (volley) {
    var NetTop = (function (_super) {
        __extends(NetTop, _super);
        function NetTop() {
            _super.call(this, [1024 / 2.0 + NetTop.RADIUS, 768 - volley.Net.HEIGHT], [0, 0], NetTop.RADIUS);
        }
        NetTop.prototype.render = function (ctx) {
            ctx.fillStyle = "purple";
            ctx.beginPath();
            ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
            ctx.fill();
        };
        NetTop.prototype.collideWith = function (other) { };
        NetTop.RADIUS = volley.Net.THICKNESS / 2.0;
        return NetTop;
    }(ps.Entity));
    volley.NetTop = NetTop;
})(volley || (volley = {}));
/// <reference path="ball.ts" />
/// <reference path="player.ts" />
/// <reference path="net.ts" />
/// <reference path="nettop.ts" />
var volley;
(function (volley) {
    var VolleyState = (function (_super) {
        __extends(VolleyState, _super);
        function VolleyState(dimensions, debug) {
            _super.call(this, dimensions);
            this.dimensions = dimensions;
            this.debug = debug;
            this.ball = new volley.Ball([500, 100], [200, 0], [0, 400], 50);
            this.leftPlayer = new volley.Player([200, 768], "green", 50, ["a", "d", "w"], volley.PlayerDirection.Left);
            this.rightPlayer = new volley.Player([890, 768], "blue", 50, ["LEFT", "RIGHT", "UP"], volley.PlayerDirection.Right);
            this.net = new volley.Net();
            this.netTop = new volley.NetTop();
        }
        VolleyState.prototype.render = function (ctx) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.dimensions[0], this.dimensions[1]);
            this.net.render(ctx);
            this.netTop.render(ctx);
            this.ball.render(ctx, this);
            this.leftPlayer.render(ctx, this);
            this.rightPlayer.render(ctx, this);
        };
        VolleyState.prototype.update = function (dt) {
            this.rightPlayer.handleInput();
            this.leftPlayer.handleInput();
            ps.detectCircularCollision(this.ball, this.leftPlayer, this);
            ps.detectCircularCollision(this.ball, this.rightPlayer, this);
            ps.detectCircularCollision(this.ball, this.netTop, this);
            this.ball.update(dt, this);
            this.leftPlayer.update(dt, this);
            this.rightPlayer.update(dt, this);
        };
        return VolleyState;
    }(ps.BaseGameState));
    volley.VolleyState = VolleyState;
})(volley || (volley = {}));
/// <reference path="piston-0.1.1.d.ts" />
/// <reference path="volleystate.ts" />
var volley;
(function (volley) {
    // create canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 768;
    document.body.appendChild(canvas);
    // prepare game state and engine
    var debug = false;
    var dimensions = [canvas.width, canvas.height];
    //let resourceManager: ps.ResourceManager = new ps.ResourceManager();
    var state = new volley.VolleyState(dimensions, debug);
    var engine = new ps.Engine(state, ctx, debug);
    engine.run();
})(volley || (volley = {}));
//# sourceMappingURL=volley-0.1.0.js.map
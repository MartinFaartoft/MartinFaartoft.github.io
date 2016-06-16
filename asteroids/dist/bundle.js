/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var meteor_1 = __webpack_require__(1);
	var gamestate_1 = __webpack_require__(4);
	// create canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth - 20;
	canvas.height = window.innerHeight - 50;
	document.body.appendChild(canvas);
	// prepare game state and engine
	var debug = false;
	var dimensions = [canvas.width, canvas.height];
	var resourceManager = new ps.ResourceManager();
	var state = new gamestate_1.default(dimensions, resourceManager, debug);
	var engine = new ps.Engine(state, ctx, debug);
	function init() {
	    state.meteors.push(new meteor_1.default([canvas.width / 10, canvas.height / 5], [100, -50], 3));
	    state.meteors.push(new meteor_1.default([canvas.width * 7 / 10, canvas.height * 4 / 5], [-100, 100], 3));
	    state.meteors.push(new meteor_1.default([10, 10], [0, 0], 3));
	}
	init();
	// load resources and start game when ready
	resourceManager.onReady(function () { return engine.run(); });
	resourceManager.preload(["assets/spaceship.png", "assets/meteor.png", "assets/burn.png", "assets/explosion.png"]);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var bullet_1 = __webpack_require__(2);
	var Meteor = (function (_super) {
	    __extends(Meteor, _super);
	    function Meteor(pos, speed, size) {
	        _super.call(this, pos, speed, size * Meteor.SCALING_FACTOR);
	        this.size = size;
	        this.rotation = Math.random() * Math.PI * 2;
	        this.rotationSpeed = Math.random() * 1.5;
	        this.sprites.push(new ps.Sprite([0, 0], [90, 90], [0, 1, 2], 3, "assets/meteor.png"));
	    }
	    Meteor.prototype.update = function (dt, state) {
	        _super.prototype.update.call(this, dt, state);
	        this.rotation += this.rotationSpeed * dt;
	        this.rotation = this.rotation % (Math.PI * 2);
	    };
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
	        if (other instanceof bullet_1.default) {
	            this.destroyed = true;
	            for (var _i = 0, _a = this.explode(); _i < _a.length; _i++) {
	                var meteor = _a[_i];
	                state.meteors.push(meteor);
	            }
	        }
	    };
	    Meteor.prototype.render = function (ctx, state) {
	        for (var _i = 0, _a = this.getWrappedBoundingCircles(state.dimensions); _i < _a.length; _i++) {
	            var bc = _a[_i];
	            this.renderInternal(ctx, bc.pos[0], bc.pos[1], bc.radius, state);
	        }
	    };
	    Meteor.prototype.renderInternal = function (ctx, x, y, radius, state) {
	        this.sprites[0].render(ctx, state.resourceManager, [x, y], [radius * 2, radius * 2], this.rotation);
	    };
	    Meteor.SCALING_FACTOR = 30;
	    Meteor.SPLIT_FACTOR = 3;
	    Meteor.POST_EXPLOSION_MAX_SPEED = 200;
	    return Meteor;
	}(ps.EntityWithSprites));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Meteor;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var explosion_1 = __webpack_require__(3);
	var meteor_1 = __webpack_require__(1);
	var Bullet = (function (_super) {
	    __extends(Bullet, _super);
	    function Bullet(pos, speed) {
	        _super.call(this, pos, speed, Bullet.RADIUS);
	        this.age = 0; // seconds
	    }
	    Bullet.prototype.update = function (dt, state) {
	        _super.prototype.update.call(this, dt, state);
	        this.age += dt;
	        if (this.age > Bullet.LIFESPAN) {
	            this.destroyed = true;
	        }
	    };
	    Bullet.prototype.collideWith = function (other, state) {
	        if (other instanceof meteor_1.default) {
	            this.destroyed = true;
	            state.explosions.push(new explosion_1.default([this.pos[0], this.pos[1]]));
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
	}(ps.Entity));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Bullet;


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Explosion = (function (_super) {
	    __extends(Explosion, _super);
	    function Explosion(pos) {
	        _super.call(this, pos, [0, 0], 60);
	        this.age = 0;
	        this.sprite = new ps.Sprite([0, 0], [120, 120], [0, 2, 1, 0, 1, 2, 0], 8, "assets/explosion.png");
	    }
	    Explosion.prototype.update = function (dt, state) {
	        _super.prototype.update.call(this, dt, state);
	        this.sprite.update(dt);
	        this.age += dt;
	        if (this.age > Explosion.LIFESPAN) {
	            this.destroyed = true;
	        }
	    };
	    Explosion.prototype.render = function (ctx, state) {
	        for (var _i = 0, _a = this.getWrappedBoundingCircles(state.dimensions); _i < _a.length; _i++) {
	            var bc = _a[_i];
	            this.renderInternal(ctx, bc.pos[0], bc.pos[1], state);
	        }
	    };
	    Explosion.prototype.renderInternal = function (ctx, x, y, state) {
	        this.sprite.render(ctx, state.resourceManager, [x, y], this.sprite.spriteSize, 0);
	    };
	    Explosion.LIFESPAN = .5;
	    return Explosion;
	}(ps.Entity));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Explosion;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var spaceship_1 = __webpack_require__(5);
	var debugDisplay_1 = __webpack_require__(6);
	var background_1 = __webpack_require__(7);
	var winscreen_1 = __webpack_require__(8);
	var gameOverScreen_1 = __webpack_require__(9);
	var GameState = (function (_super) {
	    __extends(GameState, _super);
	    function GameState(dimensions, resourceManager, debug) {
	        _super.call(this, dimensions);
	        this.dimensions = dimensions;
	        this.resourceManager = resourceManager;
	        this.debug = debug;
	        this.background = new background_1.default();
	        this.gameOverScreen = new gameOverScreen_1.default();
	        this.winScreen = new winscreen_1.default();
	        this.debugDisplay = new debugDisplay_1.default();
	        this.meteors = [];
	        this.bullets = [];
	        this.explosions = [];
	        this.isGameOver = false;
	        this.isWinner = false;
	        this.spaceship = new spaceship_1.default([dimensions[0] / 2.0, dimensions[1] / 2.0]);
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
	        if (this.meteors.length === 0) {
	            this.isWinner = true;
	        }
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
	        action(this.winScreen);
	        action(this.debugDisplay);
	    };
	    GameState.prototype.handleInput = function (dt) {
	        if (!this.isGameOver && !this.isWinner) {
	            if (ps.isKeyDown("UP")) {
	                this.spaceship.burn(dt);
	            }
	            else {
	                this.spaceship.stopBurn();
	            }
	            if (ps.isKeyDown("LEFT")) {
	                this.spaceship.rotateCounterClockWise(dt);
	            }
	            if (ps.isKeyDown("RIGHT")) {
	                this.spaceship.rotateClockWise(dt);
	            }
	            if (ps.isKeyDown("SPACE")) {
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
	}(ps.BaseGameState));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameState;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var explosion_1 = __webpack_require__(3);
	var bullet_1 = __webpack_require__(2);
	var meteor_1 = __webpack_require__(1);
	var Spaceship = (function (_super) {
	    __extends(Spaceship, _super);
	    function Spaceship(pos) {
	        _super.call(this, pos, [0, 0], Spaceship.RADIUS);
	        this.heading = Math.PI / 2.0; // facing north by default
	        this.rotation_speed = 150 * Math.PI / 180.0;
	        this.acceleration = 300;
	        this.timeSinceLastFiring = Spaceship.SHOT_DELAY; // seconds
	        this.burning = false;
	        this.spaceShipSprite = new ps.Sprite([0, 0], [59, 59], [0, 1, 2], 5, "assets/spaceship.png");
	        this.burnSprite = new ps.Sprite([0, 0], [59, 59], [0, 1, 2, 1], 8, "assets/burn.png");
	        this.sprites.push(this.spaceShipSprite, this.burnSprite);
	    }
	    Spaceship.prototype.update = function (dt, state) {
	        _super.prototype.update.call(this, dt, state);
	        this.timeSinceLastFiring += dt;
	    };
	    Spaceship.prototype.burn = function (dt) {
	        var d_x = Math.cos(this.heading);
	        var d_y = Math.sin(this.heading);
	        this.speed[0] -= d_x * this.acceleration * dt;
	        this.speed[1] -= d_y * this.acceleration * dt;
	        this.burning = true;
	    };
	    Spaceship.prototype.stopBurn = function () {
	        this.burning = false;
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
	            var gunPos = this.gunPosition();
	            var speed_x = this.speed[0] - Math.cos(this.heading) * 8 * 60;
	            var speed_y = this.speed[1] - Math.sin(this.heading) * 8 * 60;
	            this.timeSinceLastFiring = 0;
	            state.bullets.push(new bullet_1.default([gunPos[0], gunPos[1]], [speed_x, speed_y]));
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
	        if (!state.isGameOver && other instanceof meteor_1.default) {
	            this.destroyed = true;
	            state.isGameOver = true;
	            state.explosions.push(new explosion_1.default([this.pos[0], this.pos[1]]));
	        }
	    };
	    Spaceship.prototype.render = function (ctx, state) {
	        if (!this.destroyed) {
	            for (var _i = 0, _a = this.getWrappedBoundingCircles(state.dimensions); _i < _a.length; _i++) {
	                var bc = _a[_i];
	                this.renderInternal(ctx, bc.pos[0], bc.pos[1], this.heading, state);
	            }
	        }
	    };
	    Spaceship.prototype.renderInternal = function (ctx, x, y, heading, state) {
	        if (this.burning) {
	            this.burnSprite.render(ctx, state.resourceManager, [x, y], this.burnSprite.spriteSize, this.heading);
	        }
	        this.spaceShipSprite.render(ctx, state.resourceManager, [x, y], this.spaceShipSprite.spriteSize, this.heading);
	    };
	    Spaceship.SHOT_DELAY = .1; // seconds
	    Spaceship.RADIUS = 29;
	    return Spaceship;
	}(ps.EntityWithSprites));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Spaceship;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var DebugDisplay = (function (_super) {
	    __extends(DebugDisplay, _super);
	    function DebugDisplay() {
	        _super.call(this, [0, 0], [0, 0], 0);
	        this.fps = 0;
	    }
	    DebugDisplay.prototype.render = function (ctx, state) {
	        if (state.debug) {
	            ctx.fillStyle = "white";
	            ctx.font = "20px Arial";
	            ctx.fillText("player: ", 10, 20);
	            ctx.fillText("heading: " + this.roundToTwo(state.spaceship.heading), 20, 40);
	            ctx.fillText("pos_x: " + this.roundToTwo(state.spaceship.pos[0]), 20, 60);
	            ctx.fillText("pos_y: " + this.roundToTwo(state.spaceship.pos[1]), 20, 80);
	            ctx.fillText("FPS: " + this.fps, 10, 100);
	        }
	    };
	    DebugDisplay.prototype.roundToTwo = function (num) {
	        return Math.round(num * 100) / 100;
	    };
	    DebugDisplay.prototype.update = function (dt) {
	        this.fps = Math.round(1 / dt);
	    };
	    return DebugDisplay;
	}(ps.Entity));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = DebugDisplay;


/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Background = (function (_super) {
	    __extends(Background, _super);
	    function Background() {
	        _super.call(this, [0, 0], [0, 0], 0);
	    }
	    Background.prototype.render = function (ctx, state) {
	        ctx.fillStyle = "black";
	        ctx.fillRect(0, 0, state.dimensions[0], state.dimensions[1]);
	    };
	    return Background;
	}(ps.Entity));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Background;


/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var WinScreen = (function (_super) {
	    __extends(WinScreen, _super);
	    function WinScreen() {
	        _super.call(this, [0, 0], [0, 0], 0);
	    }
	    WinScreen.prototype.render = function (ctx, state) {
	        if (state.isWinner) {
	            ctx.fillStyle = "green";
	            ctx.font = "80px comic sans";
	            var textWidth = ctx.measureText("WINNER").width;
	            ctx.fillText("WINNER", (state.dimensions[0] - textWidth) / 2, state.dimensions[1] / 2);
	        }
	    };
	    return WinScreen;
	}(ps.Entity));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = WinScreen;


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
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
	            ctx.fillText("GAME OVER", (state.dimensions[0] - textWidth) / 2, state.dimensions[1] / 2);
	        }
	    };
	    return GameOverScreen;
	}(ps.Entity));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = GameOverScreen;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map
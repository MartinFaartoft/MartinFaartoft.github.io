var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="piston-0.4.0.d.ts" />
var mc;
(function (mc) {
    var Missile = (function (_super) {
        __extends(Missile, _super);
        function Missile(pos, target, speed, color) {
            _super.call(this, pos);
            this.target = target;
            this.color = color;
            this.vel = new ps.Vector(target.x - pos.x, target.y - pos.y).unit().multiply(speed);
            this.radius = 8;
            this.initialPos = pos;
            this.isCollisionDetectionEnabled = true;
            this.rotationSpeed = (Math.random() - .5) * 10;
            this.sprites.push(new ps.Sprite(new ps.Point(0, 0), [90, 90], [0, 1, 2], 3, "assets/meteor.png"));
        }
        Missile.prototype.render = function (camera) {
            camera.drawLine(this.initialPos, this.pos, 1, this.color);
            camera.paintSprites(this.pos, this.rotation, [this.radius * 2, this.radius * 2], this.sprites);
        };
        Missile.prototype.update = function (dt, dims) {
            _super.prototype.update.call(this, dt, dims);
            if (this.passedTarget()) {
                this.destroyed = true;
            }
        };
        Missile.prototype.passedTarget = function () {
            var goingDown = this.vel.y < 0;
            if (goingDown) {
                return this.pos.y < this.target.y;
            }
            return this.pos.y > this.target.y;
        };
        Missile.prototype.collideWith = function (other) {
            if (other.vel.y === 0) {
                this.destroyed = true;
            }
        };
        return Missile;
    }(ps.EntityWithSprites));
    mc.Missile = Missile;
})(mc || (mc = {}));
/// <reference path="piston-0.4.0.d.ts" />
var mc;
(function (mc) {
    var FlakExplosion = (function (_super) {
        __extends(FlakExplosion, _super);
        function FlakExplosion(pos) {
            _super.call(this, pos);
            this.expandingTime = 1;
            this.contractingTime = 1.5;
            this.radius = 15;
            this.isCollisionDetectionEnabled = true;
            this.destroyOnCollision = false;
        }
        FlakExplosion.prototype.update = function (dt, dims) {
            _super.prototype.update.call(this, dt, dims);
            if (this.expandingTime < 0 && this.contractingTime < 0) {
                this.destroyed = true;
            }
            this.expand(dt);
            this.contract(dt);
        };
        FlakExplosion.prototype.render = function (camera) {
            camera.fillCircle(this.pos, this.radius, "orange");
        };
        FlakExplosion.prototype.expand = function (dt) {
            if (this.expandingTime > 0) {
                this.expandingTime -= dt;
                this.radius += .3;
            }
        };
        FlakExplosion.prototype.contract = function (dt) {
            if (this.expandingTime < 0 && this.contractingTime > 0) {
                this.contractingTime -= dt;
                this.radius = Math.max(0, this.radius - .3);
            }
        };
        return FlakExplosion;
    }(ps.Entity));
    mc.FlakExplosion = FlakExplosion;
})(mc || (mc = {}));
/// <reference path="piston-0.4.0.d.ts" />
/// <reference path="flakexplosion.ts" />
var mc;
(function (mc) {
    var Flak = (function (_super) {
        __extends(Flak, _super);
        function Flak(pos, target) {
            _super.call(this, pos);
            this.target = target;
            this.color = "yellow";
            this.speed = 150;
            this.vel = new ps.Vector(target.x - pos.x, target.y - pos.y).unit().multiply(this.speed);
            this.radius = 5;
            this.isCollisionDetectionEnabled = false;
            this.lengthFactor = 15 / this.speed;
        }
        Flak.prototype.render = function (camera) {
            var tracer = this.pos.subtract(this.vel.multiply(this.lengthFactor));
            camera.drawLine(tracer, this.pos, 1, this.color);
        };
        Flak.prototype.update = function (dt, dims) {
            _super.prototype.update.call(this, dt, dims);
            if (this.passedTarget()) {
                this.destroyed = true;
                this.spawnExplosion();
            }
        };
        Flak.prototype.passedTarget = function () {
            var goingDown = this.vel.y < 0;
            if (goingDown) {
                return this.pos.y < this.target.y;
            }
            return this.pos.y > this.target.y;
        };
        Flak.prototype.spawnExplosion = function () {
            this.engine.registerEntity(new mc.FlakExplosion(this.pos));
        };
        return Flak;
    }(ps.Entity));
    mc.Flak = Flak;
})(mc || (mc = {}));
/// <reference path="piston-0.4.0.d.ts" />
/// <reference path="scene.ts" />
var mc;
(function (mc) {
    var City = (function (_super) {
        __extends(City, _super);
        function City(pos_x, flakCount, scene) {
            _super.call(this, new ps.Point(pos_x, 0));
            this.flakCount = flakCount;
            this.scene = scene;
            this.color = "#5EF6FF";
            this.shieldColor = "blue";
            this.outOfAmmoColor = "#FF6363";
            this.radius = 50;
            this.isCollisionDetectionEnabled = true;
            this.skyline = new ps.Sprite(new ps.Point(0, 0), [74, 38], [0], 0, "assets/skyline.png");
        }
        City.prototype.shoot = function (target) {
            if (this.flakCount > 0) {
                this.flakCount--;
                this.engine.registerEntity(new mc.Flak(this.getGunPosition(), target));
                if (this.flakCount === 0) {
                    this.color = this.outOfAmmoColor;
                }
            }
        };
        City.prototype.render = function (camera) {
            if (this.scene.isGameOver()) {
                var text = "GAME OVER";
                var width = camera.ctx.measureText(text).width;
                var x = (camera.dims.x - width) / 2.0;
                var y = camera.dims.y / 2.0 + 50;
                camera.ctx.font = "150px arial";
                camera.ctx.fillStyle = "red";
                camera.ctx.fillText("GAME OVER", x, y);
                return;
            }
            //render shield and atmosphere
            camera.fillArc(this.pos, 0, this.radius, 0, Math.PI, true, this.color);
            camera.ctx.strokeStyle = this.shieldColor;
            camera.ctx.lineWidth = 3;
            camera.ctx.stroke();
            //render skyline
            camera.paintSprites(new ps.Point(this.pos.x, this.pos.y + 20), 0, [this.radius * 1.4, this.radius], [this.skyline]);
            //render remaining flak
            camera.ctx.fillStyle = "black";
            camera.ctx.font = "30px arial";
            var posCC = camera.coordConverter.toCameraCoords(this.pos);
            camera.ctx.fillText(this.flakCount.toString(), posCC.x - 7, posCC.y - 5);
        };
        City.prototype.getGunPosition = function () {
            return new ps.Point(this.pos.x, this.radius);
        };
        City.prototype.collideWith = function (other) {
            this.scene.removeCity(this);
            if (!this.scene.isGameOver()) {
                this.destroyed = true;
            }
        };
        return City;
    }(ps.Entity));
    mc.City = City;
})(mc || (mc = {}));
/// <reference path="piston-0.4.0.d.ts" />
/// <reference path="missile.ts" />
/// <reference path="flak.ts" />
/// <reference path="city.ts" />
var mc;
(function (mc) {
    var Scene = (function () {
        function Scene(engine, dims) {
            var _this = this;
            this.engine = engine;
            this.dims = dims;
            this.cities = [];
            engine.mouse.setCustomCursor("assets/crosshair.png", new ps.Point(10, 10));
            // create cities
            var numberOfCities = 3;
            // flak allotment for each city
            var flakCount = 5;
            // distance between neighboring cities
            var spacing = dims.x / (numberOfCities + 1);
            for (var i = 1; i < numberOfCities + 1; i++) {
                var city = new mc.City(i * spacing, flakCount, this);
                engine.registerEntity(city);
                this.cities.push(city);
            }
            // make left mouse button shoot flak
            engine.mouse.addMouseDownEventListener(function (pos, button) {
                if (button === 0) {
                    var city = _this.getClosestCityWithFlak(_this.cities, pos);
                    if (city) {
                        city.shoot(pos);
                    }
                }
            });
            // create incoming missiles
            this.fireInterval = setInterval(this.addMissile.bind(this), 1000);
        }
        Scene.prototype.addMissile = function () {
            var speed = Math.floor(Math.random() * 10 + 30);
            var missile = this.createMissile(Math.random() * this.dims.x, Math.random() * this.dims.x, speed);
            this.engine.registerEntity(missile);
        };
        Scene.prototype.createMissile = function (initial_x, target_x, speed) {
            return new mc.Missile(new ps.Point(initial_x, this.dims.y), new ps.Point(target_x, 0), speed, "red");
        };
        Scene.prototype.getClosestCityWithFlak = function (cities, pos) {
            var closestCity;
            var closestDistance = Number.MAX_VALUE;
            for (var _i = 0, _a = cities.filter(function (c) { return !c.destroyed && c.flakCount > 0; }); _i < _a.length; _i++) {
                var city = _a[_i];
                var distance = city.getGunPosition().distanceTo(pos);
                if (distance < closestDistance) {
                    closestCity = city;
                    closestDistance = distance;
                }
            }
            return closestCity;
        };
        Scene.prototype.removeCity = function (city) {
            this.cities = this.cities.filter(function (c) { return c !== city; });
            if (this.cities.length === 0) {
                clearInterval(this.fireInterval);
            }
        };
        Scene.prototype.isGameOver = function () {
            return this.cities.length === 0;
        };
        return Scene;
    }());
    mc.Scene = Scene;
})(mc || (mc = {}));
/// <reference path="piston-0.4.0.d.ts" />
/// <reference path="scene.ts" />
var mc;
(function (mc) {
    var dims = new ps.Vector(1000, 500);
    // create canvas
    var canvas = document.createElement("canvas");
    canvas.width = dims.x;
    canvas.height = dims.y;
    document.body.appendChild(canvas);
    var engine = new ps.Engine(dims, canvas);
    var scene = new mc.Scene(engine, dims);
    engine.preloadResources("assets/meteor.png", "assets/skyline.png");
    engine.start();
})(mc || (mc = {}));

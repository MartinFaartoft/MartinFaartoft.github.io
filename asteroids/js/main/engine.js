"use strict";
var Framework;
(function (Framework) {
    var Engine = (function () {
        function Engine(state, ctx, debug) {
            this.state = state;
            this.ctx = ctx;
            this.debug = debug;
            this.lastTime = Date.now();
            // A cross-browser requestAnimationFrame
            // See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
            this.requestAnimationFrame = (function () {
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
            state.update(dt);
            state.render(ctx);
            this.lastTime = now;
            this.requestAnimationFrame.call(window, this.run.bind(this));
        };
        return Engine;
    }());
    Framework.Engine = Engine;
})(Framework || (Framework = {}));
//# sourceMappingURL=engine.js.map
"use strict";
var Framework;
(function (Framework) {
    var Sprite = (function () {
        function Sprite(spriteSheetPosition, size, frames, speed, url) {
            this.spriteSheetPosition = spriteSheetPosition;
            this.size = size;
            this.frames = frames;
            this.speed = speed;
            this.url = url;
            this.index = 0;
        }
        Sprite.prototype.update = function (dt) {
            this.index = this.index + this.speed * dt % this.frames.length;
        };
        Sprite.prototype.render = function (ctx, resourceManager, pos) {
            var frame = 0;
            if (this.speed > 0) {
                var idx = Math.floor(this.index);
                frame = this.frames[idx % this.frames.length];
            }
            var x = this.spriteSheetPosition[0] + frame * this.size[0];
            var y = this.spriteSheetPosition[1];
            ctx.drawImage(resourceManager.get(this.url), x, y, this.size[0], this.size[1], pos[0], pos[1], this.size[0], this.size[1]);
        };
        return Sprite;
    }());
    Framework.Sprite = Sprite;
})(Framework || (Framework = {}));
//# sourceMappingURL=sprite.js.map
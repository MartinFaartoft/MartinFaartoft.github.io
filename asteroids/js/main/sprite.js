"use strict";
var Framework;
(function (Framework) {
    var Sprite = (function () {
        function Sprite(spriteSheetCoordinates, spriteSize, frames, speed, url) {
            this.spriteSheetCoordinates = spriteSheetCoordinates;
            this.spriteSize = spriteSize;
            this.frames = frames;
            this.speed = speed;
            this.url = url;
            this.index = 0;
            this.index = Math.random() * frames.length;
        }
        Sprite.prototype.update = function (dt) {
            this.index = this.index + this.speed * dt % this.frames.length;
        };
        Sprite.prototype.render = function (ctx, resourceManager, pos, size, rotation) {
            var frame = 0;
            if (this.speed > 0) {
                var idx = Math.floor(this.index);
                frame = this.frames[idx % this.frames.length];
            }
            var sprite_x = this.spriteSheetCoordinates[0] + frame * this.spriteSize[0];
            var sprite_y = this.spriteSheetCoordinates[1];
            if (rotation === 0) {
                ctx.drawImage(resourceManager.get(this.url), sprite_x, sprite_y, this.spriteSize[0], this.spriteSize[1], pos[0] - size[0] / 2.0, pos[1] - size[1] / 2.0, size[0], size[1]);
            }
            else {
                ctx.translate(pos[0], pos[1]);
                ctx.rotate(rotation);
                ctx.drawImage(resourceManager.get(this.url), sprite_x, sprite_y, this.spriteSize[0], this.spriteSize[1], -size[0] / 2, -size[1] / 2, size[0], size[1]);
                ctx.rotate(-rotation);
                ctx.translate(-pos[0], -pos[1]);
            }
        };
        return Sprite;
    }());
    Framework.Sprite = Sprite;
})(Framework || (Framework = {}));
//# sourceMappingURL=sprite.js.map
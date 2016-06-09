"use strict";

namespace Framework {

    export class Sprite {
        index: number = 0;

        constructor(public spriteSheetPosition: number[], 
                    public size: number[], 
                    public frames: number[], 
                    public speed: number, 
                    public url: string) {
                        this.index = Math.random() * frames.length;
                     }

        update(dt: number) {
            this.index = this.index + this.speed * dt % this.frames.length;
        }

        render(ctx: CanvasRenderingContext2D, resourceManager: ResourceManager, pos: number[], size: number[]) {
            let frame = 0;

            if (this.speed > 0) {
                let idx = Math.floor(this.index);
                frame = this.frames[idx % this.frames.length];
            }

            let x = this.spriteSheetPosition[0] + frame * this.size[0];
            let y = this.spriteSheetPosition[1];
            ctx.drawImage(resourceManager.get(this.url),
                        x, y,
                        this.size[0], this.size[1],
                        pos[0], pos[1],
                        size[0], size[1]);
        }
    }
}
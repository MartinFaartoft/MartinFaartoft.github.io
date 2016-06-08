"use strict";

namespace Asteroids {
    export class Engine {
        public lastTime: number = Date.now();
        public debug: boolean = true;

        constructor(public state: GameState, public ctx: CanvasRenderingContext2D) {

        }

        run() {
            var now = Date.now();
            var dt = (now - this.lastTime) / 1000.0;
    
            if(!state.isGameOver) {
                this.update(dt);
                this.render();
                this.lastTime = now;                
                this.requestAnimationFrameShim.call(window, this.run.bind(this));
            }
            else {
                this.renderGameOver();
            }
        }

        update(dt) {
            state.handleInput(dt);
            this.updateEntities(dt);
            detectCollisions();
            state.garbageCollect();
        }

        private updateEntities(dt) {
            state.applyToEntities(e => e.update(dt));
        }

        render() {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, dimensions[0], dimensions[1]);

            state.applyToEntities(e => e.render(ctx, dimensions));

            if(this.debug) {
                ctx.fillStyle ='white';
                ctx.fillRect(state.spaceship.pos[0], state.spaceship.pos[1], 3, 3);
            
                //var gunPosition = state.spaceship.gunPosition();
                //ctx.fillRect(gunPosition[0], gunPosition[1], 3, 3);
                
                ctx.fillText("heading:" + state.spaceship.heading, 10, 10);
            }
        }

         renderGameOver() {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'red';
            ctx.font = "80px comic sans";
            ctx.fillText("GAME OVER", canvas.height / 2.0, canvas.width / 2.0);
        }

        // A cross-browser requestAnimationFrame
        // See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
        private requestAnimationFrameShim = (function(){
            return window.requestAnimationFrame       ||
                (<any>window).webkitRequestAnimationFrame ||
                (<any>window).mozRequestAnimationFrame    ||
                (<any>window).oRequestAnimationFrame      ||
                (<any>window).msRequestAnimationFrame     ||
                function(callback){
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }
}
"use strict";

import Entity = Asteroids.Entities.Entity;

namespace Asteroids {
    export class Engine {
        public lastTime: number = Date.now();

        constructor(public state: GameState, public ctx: CanvasRenderingContext2D, public debug: boolean) { }

        run() {
            let now = Date.now();
            let dt = (now - this.lastTime) / 1000.0;

            state.update(dt);
            state.render(ctx);
            this.lastTime = now;
            this.requestAnimationFrame.call(window, this.run.bind(this));
        }

        // A cross-browser requestAnimationFrame
        // See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
        private requestAnimationFrame = (function(){
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
"use strict";

namespace Asteroids.Entities {
    export abstract class Entity {
        destroyed: boolean = false;

        constructor(public pos: number[], public speed: number[], public radius: number) {
            
        }

        update(dt: number): void {
            this.pos[0] += this.speed[0] * dt;
            this.pos[1] += this.speed[1] * dt;

            this.wrap();            
        }

        wrap() {
            //exit right edge
            if(this.pos[0] > canvas.width) {
                this.pos[0] = 0;
            }
            
            //exit left edge
            if(this.pos[0] < 0) {
                this.pos[0] = canvas.width;
            }
            
            //exit top
            if(this.pos[1] < 0) {
                this.pos[1] = canvas.height;
            }
            
            //exit bottom
            if(this.pos[1] > canvas.height) {
                this.pos[1] = 0;
            }
        }

        abstract render(ctx: CanvasRenderingContext2D, dimensions: number[]);
    }

    export class Meteor extends Entity {
        public static SCALING_FACTOR: number = 30;
        public static SPLIT_FACTOR: number = 3;
        public static POST_EXPLOSION_MAX_SPEED: number = 200;
        
        constructor(pos: number[], speed: number[], public size: number) {
            super(pos, speed, size * Meteor.SCALING_FACTOR);
        }

        explode(): Meteor[] {
            if(this.size === 1) {
                return [];
            }
        
            var meteors: Meteor[] = [];

            for(var i = 0; i < Meteor.SPLIT_FACTOR; i++) {
                let initialSpeed = Math.random() * Meteor.POST_EXPLOSION_MAX_SPEED;
                let direction = Math.random() * Math.PI * 2;
                
                let pos: number[] = [this.pos[0], this.pos[1]];
                let speed: number[] = [initialSpeed * Math.cos(direction), initialSpeed * Math.sin(direction)];
                
                meteors.push(new Meteor(pos, speed, this.size - 1));
            }
            
            return meteors;
        }

        render(ctx: CanvasRenderingContext2D) {
            for(var i = -1; i <= 1; i++) {
               for(var j = -1; j <= 1; j++) {
                    this.renderInternal(ctx, this.pos[0] + i * dimensions[0], this.pos[1] + j * dimensions[1], this.radius);
                }
            }
        }

        private renderInternal(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
            ctx.fillStyle = 'grey';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, two_pi, true);
            ctx.closePath();
            ctx.fill();
        }
    }

    export class Bullet extends Entity {
        public static RADIUS: number = 5;

        constructor(pos: number[], speed: number[], public endTime: number) {
            super(pos, speed, Bullet.RADIUS);
        }

        update(dt) {
            super.update(dt);
            if(this.endTime < Date.now()) {
                this.destroyed = true;
            }
        }

        render(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = 'green';
            ctx.beginPath();
            ctx.arc(this.pos[0], this.pos[1], this.radius, 0, two_pi, true);
            ctx.closePath();
            ctx.fill();
        }
    }

    export class Spaceship extends Entity {
        public static SCALE: number = 15;
        private static SPRITE_RADIUS: number = 2;
        private static SHOT_DELAY: number = 100;

        heading: number = Math.PI / 2.0; //facing north by default
        rotation_speed: number = 150 * Math.PI / 180.0;
        acceleration: number = 300;
        lastFire: number = 0;

        constructor(pos: number[]) {
            super(pos, [0, 0], Spaceship.SPRITE_RADIUS * Spaceship.SCALE);
        }

        burn(dt: number): void {
            let d_x = Math.cos(this.heading);
            let d_y = Math.sin(this.heading);
        
            this.speed[0] -= d_x * this.acceleration * dt;
            this.speed[1] -= d_y * this.acceleration * dt;
        }

        private gunPosition(): number[] {
            return [this.pos[0] - Math.cos(this.heading) * this.radius,
                    this.pos[1] - Math.sin(this.heading) * this.radius];
        }

        canFire(): boolean {
            return this.lastFire < Date.now() - Spaceship.SHOT_DELAY;
        }

        fire(state: GameState): void {
            if(this.canFire()) {
                var gunPos = this.gunPosition();
                var speed_x = this.speed[0] - Math.cos(this.heading) * 8 * 60;
                var speed_y = this.speed[1] - Math.sin(this.heading) * 8 * 60;
                this.lastFire = Date.now();
                
                state.bullets.push(new Bullet([gunPos[0], gunPos[1]], [speed_x, speed_y], Date.now() + 1000));
            }
        }
    
        rotateClockWise(dt): void {
            this.heading += this.rotation_speed * dt;
            this.heading = this.heading % (Math.PI * 2);
        }
        
        rotateCounterClockWise(dt): void {
            this.heading -= this.rotation_speed * dt
            this.heading = this.heading % (Math.PI * 2);
        }

        render(ctx: CanvasRenderingContext2D, dimensions: number[]) {
            for(var i = -1; i <= 1; i++) {
                for(var j = -1; j <= 1; j++) {
                    this.renderInternal(ctx, this.pos[0] + i * dimensions[0], this.pos[1] + j * dimensions[1], this.heading);
                }
            }
        }

        renderInternal(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number) {        
            var scale = Spaceship.SCALE;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(heading);
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(-2 * scale, 0);
            ctx.lineTo(2 * scale, 2 * scale);
            ctx.lineTo(scale, 0);
            ctx.lineTo(2 * scale, -2 * scale);
            ctx.fill();
            ctx.translate(x, y);
            ctx.restore();
        }
    }
}
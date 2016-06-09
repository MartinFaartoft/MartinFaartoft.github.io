"use strict";

namespace Asteroids.Entities {
    export interface Collidable {
        collideWith(other: Entity, state: GameState);
    }

    export abstract class Entity {
        destroyed: boolean = false;

        constructor(public pos: number[], public speed: number[], public radius: number) {

        }

        update(dt: number, dimensions: number[]): void {
            this.pos[0] += this.speed[0] * dt;
            this.pos[1] += this.speed[1] * dt;

            this.wrap();
        }

        private wrap() {
            // exit right edge
            if (this.pos[0] > dimensions[0]) {
                this.pos[0] -= dimensions[0];
            }

            // exit left edge
            if (this.pos[0] < 0) {
                this.pos[0] += dimensions[0];
            }

            // exit top
            if (this.pos[1] < 0) {
                this.pos[1] += dimensions[1];
            }

            // exit bottom
            if (this.pos[1] > dimensions[1]) {
                this.pos[1] -= dimensions[1];
            }
        }

        getWrappedBoundingCircles(dimensions: number[]) {
            let boundingCircles: any[] = [this];
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    boundingCircles.push({
                        pos: [this.pos[0] + i * dimensions[0], this.pos[1] + j * dimensions[1]],
                        radius: this.radius,
                        entity: this
                    });
                }
            }
            return boundingCircles;
        }

        abstract render(ctx: CanvasRenderingContext2D, state: GameState);
    }

    export class Meteor extends Entity implements Collidable {
        public static SCALING_FACTOR: number = 30;
        public static SPLIT_FACTOR: number = 3;
        public static POST_EXPLOSION_MAX_SPEED: number = 200;

        constructor(pos: number[], speed: number[], public size: number) {
            super(pos, speed, size * Meteor.SCALING_FACTOR);
        }

        private explode(): Meteor[] {
            if (this.size === 1) {
                return [];
            }

            let meteors: Meteor[] = [];

            for (let i = 0; i < Meteor.SPLIT_FACTOR; i++) {
                let initialSpeed = Math.random() * Meteor.POST_EXPLOSION_MAX_SPEED;
                let direction = Math.random() * Math.PI * 2;

                let pos: number[] = [this.pos[0], this.pos[1]];
                let speed: number[] = [initialSpeed * Math.cos(direction), initialSpeed * Math.sin(direction)];

                meteors.push(new Meteor(pos, speed, this.size - 1));
            }

            return meteors;
        }

        collideWith(other: Entity, state: GameState) {
            if (other instanceof Bullet) {
                this.destroyed = true;

                for (let meteor of this.explode()) {
                    state.meteors.push(meteor);
                }
            }
        }

        render(ctx: CanvasRenderingContext2D, state: GameState) {
            for (let bc of this.getWrappedBoundingCircles(dimensions)) {
                this.renderInternal(ctx, bc.pos[0], bc.pos[1], bc.radius);
            }
        }

        private renderInternal(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    }

    export class Bullet extends Entity implements Collidable {
        public static RADIUS: number = 5;

        constructor(pos: number[], speed: number[], public endTime: number) {
            super(pos, speed, Bullet.RADIUS);
        }

        update(dt: number, dimensions: number[]) {
            super.update(dt, dimensions);
            if (this.endTime < Date.now()) {
                this.destroyed = true;
            }
        }

        collideWith(other: Entity, state: GameState) {
            if (other instanceof Meteor) {
                this.destroyed = true;
            }
        }

        render(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    }

    export class Spaceship extends Entity implements Collidable {
        public static SCALE: number = 15;
        private static SPRITE_RADIUS: number = 2;
        private static SHOT_DELAY: number = 100;

        heading: number = Math.PI / 2.0; // facing north by default
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

        private canFire(): boolean {
            return this.lastFire < Date.now() - Spaceship.SHOT_DELAY;
        }

        fire(state: GameState): void {
            if (this.canFire()) {
                let gunPos = this.gunPosition();
                let speed_x = this.speed[0] - Math.cos(this.heading) * 8 * 60;
                let speed_y = this.speed[1] - Math.sin(this.heading) * 8 * 60;
                this.lastFire = Date.now();

                state.bullets.push(new Bullet([gunPos[0], gunPos[1]], [speed_x, speed_y], Date.now() + 1000));
            }
        }

        rotateClockWise(dt): void {
            this.heading += this.rotation_speed * dt;
            this.heading = this.heading % (Math.PI * 2);
        }

        rotateCounterClockWise(dt): void {
            this.heading -= this.rotation_speed * dt;
            this.heading = this.heading % (Math.PI * 2);
        }

        collideWith(other: Entity, state: GameState) {
            if (other instanceof Meteor) {
                this.destroyed = true;
                state.isGameOver = true;
            }
        }

        render(ctx: CanvasRenderingContext2D, state: GameState) {
            for (let bc of this.getWrappedBoundingCircles(state.dimensions)) {
                this.renderInternal(ctx, bc.pos[0], bc.pos[1], this.heading);
            }
        }

        private renderInternal(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number) {
            let scale = Spaceship.SCALE;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(heading);
            ctx.fillStyle = "red";
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

    export class Background extends Entity {

        constructor() {
            super([0, 0], [0, 0], 0);
        }

        render(ctx: CanvasRenderingContext2D, state: GameState) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, state.dimensions[0], state.dimensions[1]);
        }

        update(dt: number, dimensions: number[]) {
            // intentionally left blank
        }
    }

    export class GameOverScreen extends Entity {

        constructor() {
            super([0, 0], [0, 0], 0);
        }

        render(ctx: CanvasRenderingContext2D, state: GameState) {
            if (state.isGameOver) {
                ctx.fillStyle = "red";
                ctx.font = "80px comic sans";
                let textWidth = ctx.measureText("GAME OVER").width;
                ctx.fillText("GAME OVER", (state.dimensions[0] - textWidth) / 2.0, state.dimensions[1] / 2.0);
            }
        }

        update(dt: number, dimensions: number[]) {
            // intentionally left blank
        }
    }
}
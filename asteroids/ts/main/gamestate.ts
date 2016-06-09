"use strict";

namespace Asteroids {
    import Background = Entities.Background;
    import GameOverScreen = Entities.GameOverScreen;
    import Entity = Entities.Entity;
    import Spaceship = Entities.Spaceship;
    import Bullet = Entities.Bullet;
    import Meteor = Entities.Meteor;
    import Explosion = Entities.Explosion;
    import DebugDisplay = Entities.DebugDisplay;

    export class GameState {
        public background: Background = new Background();
        public gameOverScreen: GameOverScreen = new GameOverScreen();
        public debugDisplay: DebugDisplay = new DebugDisplay();
        public meteors: Meteor[] = [];
        public bullets: Bullet[] = [];
        public explosions: Explosion[] = [];
        public spaceship: Spaceship;
        public isGameOver: boolean = false;

        constructor(public dimensions: number[], 
                    public resourceManager: Framework.ResourceManager, 
                    public debug: boolean) {
            this.spaceship = new Spaceship([dimensions[0] / 2.0, dimensions[1] / 2.0]);
        }

        garbageCollect() {
            this.bullets = this.bullets.filter(b => !b.destroyed);
            this.meteors = this.meteors.filter(m => !m.destroyed);
            this.explosions = this.explosions.filter(e => !e.destroyed)
        }

        update(dt: number) {
            this.handleInput(dt);
            this.applyToEntities(e => e.update(dt, this));
            this.detectCollisions();
            this.garbageCollect();
        }

        render(ctx: CanvasRenderingContext2D) {
            this.applyToEntities(e => e.render(ctx, this));
        }

        applyToEntities(action: (Entity) => void) {
            action(this.background);

            action(this.spaceship);

            for (let e of this.explosions) {
                action(e);
            }

            for (let m of this.meteors) {
                action(m);
            }

            for (let b of this.bullets) {
                action(b);
            }

            action(this.gameOverScreen);
            action(this.debugDisplay);
        }

        handleInput(dt) {
            if (!this.isGameOver) {
                if (Framework.isKeyDown("UP")) {
                    this.spaceship.burn(dt);
                } else {
                    this.spaceship.stopBurn();
                }

                if (Framework.isKeyDown("LEFT")) {
                    this.spaceship.rotateCounterClockWise(dt);
                }

                if (Framework.isKeyDown("RIGHT")) {
                    this.spaceship.rotateClockWise(dt);
                }

                if (Framework.isKeyDown("SPACE")) {
                    this.spaceship.fire(this);
                }
            }
        }

        detectCollisions() {
            // bullet meteor collision
            for (let bullet of this.bullets) {
                for (let meteor of this.meteors) {
                    if (this.detectCollisionWithWrapping(bullet, meteor)) {
                        bullet.collideWith(meteor, this);
                        meteor.collideWith(bullet, this);
                    }
                }
            }

            // player meteor collision
            for (let meteor of this.meteors) {
                if (this.detectCollisionWithWrapping(meteor, this.spaceship)) {
                    this.spaceship.collideWith(meteor, this);
                    meteor.collideWith(this.spaceship, this);
                }
            };
        }

        detectCollisionWithWrapping(a: Entity, b: Entity) {
            let wrappedEntities = b.getWrappedBoundingCircles(this.dimensions);
            for (let i = 0; i < wrappedEntities.length; i++) {
                if (this.detectCollision(a, wrappedEntities[i])) {
                    return true;
                }
            }

            return false;
        }

        detectCollision(a, b) {
            // circle collision
            let dx = a.pos[0] - b.pos[0];
            let dy = a.pos[1] - b.pos[1];

            let distance = Math.sqrt(dx * dx + dy * dy);
            return distance < a.radius + b.radius;
        }
    }
}
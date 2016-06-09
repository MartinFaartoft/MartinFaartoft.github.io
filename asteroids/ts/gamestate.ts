"use strict";

namespace Asteroids {
    import Background = Entities.Background;
    import GameOverScreen = Entities.GameOverScreen;
    import Spaceship = Entities.Spaceship;
    import Bullet = Entities.Bullet;
    import Meteor = Entities.Meteor;

    export class GameState {
        public background: Background = new Background();
        public gameOverScreen: GameOverScreen = new GameOverScreen();
        public meteors: Meteor[] = [];
        public bullets: Bullet[] = [];
        public spaceship: Spaceship;
        public isGameOver: boolean = false;

        constructor(public dimensions: number[]) {
            this.spaceship = new Spaceship([dimensions[0] / 2.0, dimensions[1] / 2.0]);
        }

        garbageCollect() {
            this.bullets = this.bullets.filter(b => !b.destroyed);
            this.meteors = this.meteors.filter(m => !m.destroyed);
        }

        update(dt: number) {
            this.applyToEntities(e => e.update(dt, dimensions));
        }

        applyToEntities(action: (Entity) => void) {
            action(this.background);
            action(this.gameOverScreen);

            action(this.spaceship);

            for (let m of this.meteors) {
                action(m);
            }

            for (let b of this.bullets) {
                action(b);
            }
        }

        handleInput(dt) {
            if (Input.isDown("UP")) {
                this.spaceship.burn(dt);
            }

            if (Input.isDown("LEFT")) {
                this.spaceship.rotateCounterClockWise(dt);
            }

            if (Input.isDown("RIGHT")) {
                this.spaceship.rotateClockWise(dt);
            }

            if (Input.isDown("SPACE")) {
                this.spaceship.fire(this);
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
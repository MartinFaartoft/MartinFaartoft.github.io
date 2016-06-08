"use strict";

namespace Asteroids {
    export class GameState {
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

        applyToEntities(action: (Entity) => void) {
            action(state.spaceship);

            for (var m of state.meteors) {
                action(m);
            }

            for (var b of state.bullets) {
                action(b);
            }
        }

        handleInput(dt) {
            if(Input.isDown('UP')) {
                state.spaceship.burn(dt);
            }
            
            if(Input.isDown('LEFT')) {
                state.spaceship.rotateCounterClockWise(dt);
            }
            
            if(Input.isDown('RIGHT')) {
                state.spaceship.rotateClockWise(dt);
            }
            
            if(Input.isDown('SPACE')) {
                state.spaceship.fire(this);
            }
        }
    }
}
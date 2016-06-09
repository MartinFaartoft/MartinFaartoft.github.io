namespace Test {

    import GameState = Asteroids.GameState;
    import Spaceship = Asteroids.Entities.Spaceship;

    let state: GameState = null;
    let spaceship: Spaceship = null;
    
    beforeEach(() =>  {
        state = new Asteroids.GameState([100, 100], false);
        spaceship = new Asteroids.Entities.Spaceship([0, 0]);
    });

    describe("Spaceship", () => {
        it("should fire", () => {
            spaceship.fire(state);
            expect(state.bullets.length).toEqual(1);
        });

        it("should not fire before cooldown", () => {
            spaceship.fire(state);
            spaceship.fire(state);

            expect(state.bullets.length).toEqual(1);
        });

        it("should fire after cooldown", () => {
            spaceship.fire(state);
            spaceship.update(Spaceship.SHOT_DELAY, state.dimensions);
            spaceship.fire(state);

            expect(state.bullets.length).toEqual(2);
        });

        it("should wrap around top of screen", () => {
            spaceship.pos = [0, -1];
            spaceship.update(0, state.dimensions);

            expect(spaceship.pos[1]).toEqual(state.dimensions[1] - 1);
        });
    });

}
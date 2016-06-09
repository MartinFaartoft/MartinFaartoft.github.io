namespace Test {

    import GameState = Asteroids.GameState;
    import Spaceship = Asteroids.Entities.Spaceship;
    import Meteor = Asteroids.Entities.Meteor;
    import Bullet = Asteroids.Entities.Bullet;

    let state: GameState = null;
    let spaceship: Spaceship = null;
    let resourceManager: Framework.ResourceManager = new Framework.ResourceManager();
    
    beforeEach(() =>  {
        state = new Asteroids.GameState([100, 100], resourceManager, false);
        spaceship = new Asteroids.Entities.Spaceship([0, 0]);
    });

    describe("A spaceship", () => {
        it("should be able to fire immediately", () => {
            spaceship.fire(state);
            expect(state.bullets.length).toEqual(1);
        });

        it("should not be able to fire again before cooldown", () => {
            spaceship.fire(state);
            spaceship.fire(state);

            expect(state.bullets.length).toEqual(1);
        });

        it("should be able to fire again after cooldown", () => {
            spaceship.fire(state);
            spaceship.update(Spaceship.SHOT_DELAY, state);
            spaceship.fire(state);

            expect(state.bullets.length).toEqual(2);
        });

        it("should wrap around top edge", () => {
            spaceship.pos = [0, -1];
            spaceship.update(0, state);

            expect(spaceship.pos[1]).toEqual(state.dimensions[1] - 1);
        });

        it("should wrap around bottom edge", () => {
            spaceship.pos = [0, state.dimensions[1] + 1];
            spaceship.update(0, state);

            expect(spaceship.pos[1]).toEqual(1);
        });

        it("should wrap around left edge", () => {
            spaceship.pos = [-1, 0];
            spaceship.update(0, state);

            expect(spaceship.pos[0]).toEqual(state.dimensions[0] - 1);
        });

        it("should wrap around right edge", () => {
            spaceship.pos = [state.dimensions[0] + 1, 0];
            spaceship.update(0, state);

            expect(spaceship.pos[0]).toEqual(1);
        });

        it("should end game if colliding with a meteor", () => {
            spaceship.collideWith(new Meteor([0, 0], [0, 0], 3), state);

            expect(state.isGameOver).toBeTruthy();
        });

        it("should not end game if colliding with a bullet", () => {
            spaceship.collideWith(new Bullet([0, 0], [0, 0]), state);

            expect(state.isGameOver).toBeFalsy();
        });
    });

}
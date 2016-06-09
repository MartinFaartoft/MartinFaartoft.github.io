var Test;
(function (Test) {
    var Spaceship = Asteroids.Entities.Spaceship;
    var Meteor = Asteroids.Entities.Meteor;
    var Bullet = Asteroids.Entities.Bullet;
    var state = null;
    var spaceship = null;
    beforeEach(function () {
        state = new Asteroids.GameState([100, 100], false);
        spaceship = new Asteroids.Entities.Spaceship([0, 0]);
    });
    describe("A spaceship", function () {
        it("should be able to fire immediately", function () {
            spaceship.fire(state);
            expect(state.bullets.length).toEqual(1);
        });
        it("should not fire before cooldown", function () {
            spaceship.fire(state);
            spaceship.fire(state);
            expect(state.bullets.length).toEqual(1);
        });
        it("should fire after cooldown", function () {
            spaceship.fire(state);
            spaceship.update(Spaceship.SHOT_DELAY, state);
            spaceship.fire(state);
            expect(state.bullets.length).toEqual(2);
        });
        it("should wrap around top edge", function () {
            spaceship.pos = [0, -1];
            spaceship.update(0, state);
            expect(spaceship.pos[1]).toEqual(state.dimensions[1] - 1);
        });
        it("should wrap around bottom edge", function () {
            spaceship.pos = [0, state.dimensions[1] + 1];
            spaceship.update(0, state);
            expect(spaceship.pos[1]).toEqual(1);
        });
        it("should wrap around left edge", function () {
            spaceship.pos = [-1, 0];
            spaceship.update(0, state);
            expect(spaceship.pos[0]).toEqual(state.dimensions[0] - 1);
        });
        it("should wrap around right edge", function () {
            spaceship.pos = [state.dimensions[0] + 1, 0];
            spaceship.update(0, state);
            expect(spaceship.pos[0]).toEqual(1);
        });
        it("should end game if colliding with a meteor", function () {
            spaceship.collideWith(new Meteor([0, 0], [0, 0], 3), state);
            expect(state.isGameOver).toBeTruthy();
        });
        it("should not end game if colliding with a bullet", function () {
            spaceship.collideWith(new Bullet([0, 0], [0, 0]), state);
            expect(state.isGameOver).toBeFalsy();
        });
    });
})(Test || (Test = {}));
//# sourceMappingURL=spaceship.js.map
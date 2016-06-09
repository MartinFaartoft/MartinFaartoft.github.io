var Test;
(function (Test) {
    var Spaceship = Asteroids.Entities.Spaceship;
    var state = null;
    var spaceship = null;
    beforeEach(function () {
        state = new Asteroids.GameState([100, 100], false);
        spaceship = new Asteroids.Entities.Spaceship([0, 0]);
    });
    describe("Spaceship", function () {
        it("should fire", function () {
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
            spaceship.update(Spaceship.SHOT_DELAY, state.dimensions);
            spaceship.fire(state);
            expect(state.bullets.length).toEqual(2);
        });
        it("should wrap around top of screen", function () {
            spaceship.pos = [0, -1];
            spaceship.update(0, state.dimensions);
            expect(spaceship.pos[1]).toEqual(state.dimensions[1] - 1);
        });
    });
})(Test || (Test = {}));
//# sourceMappingURL=test.js.map
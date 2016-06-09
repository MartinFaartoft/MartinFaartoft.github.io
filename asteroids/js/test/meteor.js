var Test;
(function (Test) {
    var GameState = Asteroids.GameState;
    var Spaceship = Asteroids.Entities.Spaceship;
    var Meteor = Asteroids.Entities.Meteor;
    var Bullet = Asteroids.Entities.Bullet;
    var state = null;
    var spaceship = null;
    var bullet = null;
    var largeMeteor = null;
    var smallMeteor = null;
    beforeEach(function () {
        state = new GameState([100, 100], null, false);
        spaceship = new Spaceship([0, 0]);
        bullet = new Bullet([0, 0], [0, 0]);
        largeMeteor = new Meteor([0, 0], [0, 0], 3);
        smallMeteor = new Meteor([0, 0], [0, 0], 1);
    });
    describe("A large meteor", function () {
        it("should split into 3 pieces when hit by a bullet", function () {
            largeMeteor.collideWith(bullet, state);
            expect(state.meteors.length).toEqual(3);
        });
        it("should be destroyed when hit by a bullet", function () {
            largeMeteor.collideWith(bullet, state);
            expect(largeMeteor.destroyed).toBeTruthy();
        });
    });
    describe("A small meteor", function () {
        it("should not split when hit by a bullet", function () {
            smallMeteor.collideWith(bullet, state);
            expect(state.meteors.length).toEqual(0);
        });
    });
})(Test || (Test = {}));
//# sourceMappingURL=meteor.js.map
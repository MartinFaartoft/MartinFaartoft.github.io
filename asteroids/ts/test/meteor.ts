namespace Test {

    import GameState = Asteroids.GameState;
    import Spaceship = Asteroids.Entities.Spaceship;
    import Meteor = Asteroids.Entities.Meteor;
    import Bullet = Asteroids.Entities.Bullet;

    let state: GameState = null;
    let spaceship: Spaceship = null;
    let bullet: Bullet = null;
    let largeMeteor: Meteor = null;
    let smallMeteor: Meteor = null;
    
    beforeEach(() =>  {
        state = new GameState([100, 100], null, false);
        spaceship = new Spaceship([0, 0]);
        bullet = new Bullet([0, 0], [0, 0]);
        largeMeteor = new Meteor([0, 0], [0, 0], 3);
        smallMeteor = new Meteor([0, 0], [0, 0], 1);
    });

    describe("A large meteor", () => {
        it("should split into 3 pieces when hit by a bullet", () => {
            largeMeteor.collideWith(bullet, state);

            expect(state.meteors.length).toEqual(3);
        });

        it("should be destroyed when hit by a bullet", () => {
            largeMeteor.collideWith(bullet, state);

            expect(largeMeteor.destroyed).toBeTruthy();
        });
    });

    describe("A small meteor", () => {
        it("should not split when hit by a bullet", () => {
            smallMeteor.collideWith(bullet, state);

            expect(state.meteors.length).toEqual(0);
        });
    });
}

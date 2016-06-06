class Entity {
    constructor(public pos: number[], public speed: number[]) {
        
    }

    advance(dt: number): void {
        this.pos[0] += this.speed[0] * dt;
        this.pos[1] += this.speed[1] * dt;
    }
}

class Meteor extends Entity {
        public static SCALING_FACTOR: number = 30;
        public static SPLIT_FACTOR: number = 3;
        public static POST_EXPLOSION_MAX_SPEED: number = 200;

        exploded: boolean;
        radius: number;
    
    constructor(public pos: number[], public speed: number[], public size: number) {
        super(pos, speed);
        this.exploded = false;
        this.radius = size * Meteor.SCALING_FACTOR;
    }

    explode(): Meteor[] {
        if(this.size === 1) {
            return [];
        }
    
        var meteors: Meteor[] = [];

        for(var i = 0; i < Meteor.SPLIT_FACTOR; i++) {
            let initialSpeed = Math.random() * Meteor.POST_EXPLOSION_MAX_SPEED;
            let direction = Math.random() * Math.PI * 2;
            
            let pos: number[] = [this.pos[0], this.pos[1]];
            let speed: number[] = [initialSpeed * Math.cos(direction), initialSpeed * Math.sin(direction)];
              
            meteors.push(new Meteor(pos, speed, this.size - 1));
        }
        
        return meteors;
    }
}
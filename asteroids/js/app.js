// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

//create canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 50;
document.body.appendChild(canvas);

var lastTime;
var two_pi = Math.PI * 2;

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    
    if(!isGameOver) {
        update(dt);
        render();
        
        lastTime = now;
    
        requestAnimFrame(main);
    }
    else {
        renderGameOver();
    }
}

//Game state
var player = {
    pos: [canvas.width / 2.0 , canvas.height / 2.0],
    speed: [0, 0],
    acceleration: 15,
    heading: Math.PI / 2.0, //direction the nose is pointing
    scale: 15.0,
    radius: 30, // 2 * scale
    rotation_speed: 150 * Math.PI / 180.0, //radians per seconds
    burn: function(dt) {
        var d_x = Math.cos(this.heading);
        var d_y = Math.sin(this.heading);
        
        this.speed[0] -= d_x * this.acceleration * dt;
        this.speed[1] -= d_y * this.acceleration * dt;
    },
    
    gunPosition: function() {
        var x = this.pos[0] - Math.cos(this.heading) * 2 * this.scale;
        var y = this.pos[1] - Math.sin(this.heading) * 2 * this.scale;
        return [x,y];
    },
    
    fire: function(dt) {
        if(lastFire < Date.now() - 100) {
            var gunPos = this.gunPosition();
            var speed_x = this.speed[0] - Math.cos(this.heading) * 8;
            var speed_y = this.speed[1] - Math.sin(this.heading) * 8;
            bullets.push({
                    pos: [gunPos[0], gunPos[1]],
                    radius: 5,
                    speed: [speed_x, speed_y],
                    endTime: Date.now() + 1000
                    });
            lastFire = Date.now();
        }
    },
    
    rotateClockWise: function(dt) {
        this.heading += this.rotation_speed * dt;
        this.heading = this.heading % two_pi;
    },
    rotateCounterClockWise: function(dt) {
        this.heading -= this.rotation_speed * dt
        this.heading = this.heading % two_pi;
    }
    
};
var debug = false;
var bullets = [];
var meteors = [];

var lastFire = Date.now();
var gameTime = 0;
var isGameOver = false;

//update
function update(dt) {
    gameTime += dt;
    
    handleInput(dt);
    
    updateEntities(dt);
    
    detectCollisions();
};

//input
function handleInput(dt) {
    if(input.isDown('UP')) {
        player.burn(dt);
    }
    
    if(input.isDown('LEFT')) {
        player.rotateCounterClockWise(dt);
    }
    
    if(input.isDown('RIGHT')) {
        player.rotateClockWise(dt);
    }
    
    if(input.isDown('SPACE')) {
        player.fire();
    }
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    renderMeteors();
    renderWrappedPlayers(player);
    
    renderBullets();
    
    if(debug) {
        ctx.fillStyle ='black';
        ctx.fillRect(player.pos[0], player.pos[1], 3, 3);
    
        var gunPosition = player.gunPosition();
        ctx.fillRect(gunPosition[0], gunPosition[1], 3, 3);
        
        ctx.fillText("heading:" + player.heading, 10, 10);
    }
}

function renderGameOver() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = "80px comic sans";
    ctx.fillText("GAME OVER", canvas.height / 2.0, canvas.width / 2.0);
}

function renderMeteors() {
    for (var i = 0; i < meteors.length; i++) {       
        renderWrappedMeteors(meteors[i]);
    }
}

function getWrappedEntityBoundingCircles(entity) {
    var boundingCircles = [entity];
    for(var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
            boundingCircles.push({
                pos: [entity.pos[0] + i * canvas.width, entity.pos[1] + j * canvas.height], 
                radius: entity.radius
            });
        }
    }    
    return boundingCircles;
}

/**
 * render the actual player along with the 8 wrapped ones
 * can be optimized by inspecting actual coords and only rendering partially visible ones
 */
function renderWrappedPlayers(p) {
    for(var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
            renderPlayer(p.pos[0] + i * canvas.width, p.pos[1] + j * canvas.height, p);
        }
    }
}

/**
 * render the actual meteor along with the 8 wrapped ones
 * can be optimized by inspecting actual coords and only rendering partially visible ones
 */
function renderWrappedMeteors(m) { 
    for(var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
            renderMeteor(m.pos[0] + i * canvas.width, m.pos[1] + j * canvas.height, m.radius);
        }
    }
}

function renderMeteor(x, y, r) {
    ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, two_pi, true);
        ctx.closePath();
        ctx.fill();
}

function renderBullets() {
    for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(b.pos[0], b.pos[1], b.radius, 0, two_pi, true);
        ctx.closePath();
        ctx.fill();
    }
}

function renderPlayer(x, y, player) {
    var scale = player.scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.heading);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 0);
    ctx.lineTo(2 * scale, 2 * scale);
    ctx.lineTo(scale, 0);
    ctx.lineTo(2 * scale, -2 * scale);
    ctx.fill();
    ctx.translate(x, y);
    ctx.restore();
}

function updateEntities(dt) {
    player.pos[0] += player.speed[0];
    player.pos[1] += player.speed[1];
    
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        bullet.pos[0] += bullet.speed[0];
        bullet.pos[1] += bullet.speed[1];
    }
    
    for (var i = 0; i < meteors.length; i++) {
        var meteor = meteors[i];
        meteor.pos[0] += meteor.speed[0];
        meteor.pos[1] += meteor.speed[1];
    }
    
    wrapEntities();
    removeBullets();
    removeMeteors();
}

function wrapEntities() {
    wrapEntity(player);
    for (var i = 0; i < bullets.length; i++) {
        wrapEntity(bullets[i]);
    }
    
    for (var i = 0; i < meteors.length; i++) {
        wrapEntity(meteors[i]);
    }
}

function wrapEntity(entity) {
    //exit right edge
    if(entity.pos[0] > canvas.width) {
        entity.pos[0] = 0;
    }
    
    //exit left edge
    if(entity.pos[0] < 0) {
        entity.pos[0] = canvas.width;
    }
    
    //exit top
    if(entity.pos[1] < 0) {
        entity.pos[1] = canvas.height;
    }
    
    //exit bottom
    if(entity.pos[1] > canvas.height) {
        entity.pos[1] = 0;
    }
}

function gameOver() {
    isGameOver = true;
}

function removeBullets() {
    var now = Date.now();
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        if(bullet.endTime < now || bullet.exploded) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function removeMeteors() {
    for (var i = 0; i < meteors.length; i++) {
        var meteor = meteors[i];
        if(meteor.exploded) {
            meteors.splice(i, 1);
            i--;
            explodeMeteor(meteor);
        }
    }
}

function detectCollisions() {
    //bullet meteor collision
    for(var i = 0; i < bullets.length; i++) {
        for(var j = 0; j < meteors.length; j++) {
            if(detectCollisionWithWrapping(bullets[i], meteors[j])) {
                bullets[i].exploded = true;
                meteors[j].exploded = true;
            }
        }
    }
    
    //player meteor collision
    forEachMeteor(function(meteor) {
        if(detectCollisionWithWrapping(meteor, player)) {
            gameOver();
        }
    });
}

function forEachMeteor(fun) {
    for(var i = 0; i < meteors.length; i++) {
        fun(meteors[i])
    }
}

function detectCollisionWithWrapping(a, b) {
    var wrappedEntities = getWrappedEntityBoundingCircles(b);
    for(var i = 0; i < wrappedEntities.length; i++) {
        if(detectCollision(a, wrappedEntities[i])) {
            return true;
        }
    }
    
    return false;
}

function detectCollision(a, b) {
    //circle collision
    var dx = a.pos[0] - b.pos[0];
    var dy = a.pos[1] - b.pos[1];
    
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}

function explodeMeteor(meteor) {
    if(meteor.size === 1) {
        return;
    }
    
    var splitFactor = 3;
    
    for(var i = 0; i < splitFactor; i++) {
        var initialSpeed = Math.random() * 6;
        var direction = Math.random() * two_pi;
        meteors.push({
           exploded: false,
           pos: [meteor.pos[0], meteor.pos[1]],
           speed: [initialSpeed * Math.cos(direction), initialSpeed * Math.sin(direction)],
           size: meteor.size - 1,
           radius: (meteor.size - 1) * 30
        });
    }
}

 function init() {
    meteors.push({
        exploded: false,
        pos: [canvas.width / 10, canvas.height / 5],
        speed: [2, -.5],
        size: 3,
        radius: 30 * 3
    });
    
    meteors.push({
        exploded: false,
        pos: [canvas.width * 7 / 10, canvas.height * 4 / 5],
        speed: [-1, 1],
        size: 3,
        radius: 30 * 3
    });
    
    meteors.push({
        exploded: false,
        pos: [10, 10],
        speed: [0, 0],
        size: 3,
        radius: 30 * 3
    });
}

init();
main();

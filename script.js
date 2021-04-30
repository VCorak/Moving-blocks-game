const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// Global variables, we need them on multiple places

const cellSize = 100;
const cellGap = 3; // cell size, square size of defender blue cell
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
let chosenDefender = 1;

const gameGrid = [];
const defender = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];


// Mouse

const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
}
canvas.addEventListener('mousedown', function (){
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function (){
    mouse.clicked = false;
});


let canvasPosition = canvas.getBoundingClientRect(); // this function returns DOM rectangle object
// witch contains info about size of element and its position
//console.log(canvasPosition);
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
})

// Game board

const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }

    }
}
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw(); // [i] represents object, zero, one, two...and draws each individual cell
    }
}
// Projectiles

class Projectiles {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 25;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2); // drawing a circle
        ctx.fill();
    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++){ // nested loop for projectiles to do something to enemies, enemies health- projectiles power
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j]))
            {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1); // when it hits the enemy or collides with enemy remove it from array
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){ // we want to hit the enemy when it's visible in cell
            projectiles.splice(i, 1); // removing it from array when it gets to end of CellSize
            i--; // this rule is for every other projectile coming
        }
        //console.log('projectiles ' + projectiles.length);
    }
}
// Defenders
const defender1 = new Image();
defender1.src = 'images/defender1.png';
const defender2 = new Image();
defender2.src = 'images/defender2.png';


class Defender {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2; // get space on left and right size of cell
        this.height = cellSize - cellGap * 2; // get space on top and bottom size of cell
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 121;
        this.spriteHeight = 121;
        this.minFrame = 0;
        this.maxFrame = 16;
        this.chosenDefender = chosenDefender;
    }
    draw(){
        //ctx.fillStyle = 'blue';
       // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        if (this.chosenDefender === 1) {
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0,
                this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if (this.chosenDefender === 2) {
            ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0,
                this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
        //ctx.drawImage(defender1, sx, sy, sw, sh, dx, dy, dw, dh);

    }
    update(){ // adding new projectiles to array only if enemy is visible (no shooting in empty space)
        if (frame % 10 === 0) {
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if (this.frameX === 15) this.shootNow = true;
        }
if(this.chosenDefender === 1) {
    if (this.shooting) {
        this.minFrame = 0;
        this.maxFrame = 16;
    } else {
        this.minFrame = 17;
        this.maxFrame = 24;
    }
} else if (this.chosenDefender === 2) {
    if (this.shooting) {
        this.minFrame = 13;
        this.maxFrame = 28;
    } else {
        this.minFrame = 0;
        this.maxFrame = 12;
    }
}

        if (this.shooting && this.shootNow){
            //this.timer++;
            //if (this.timer % 100 === 0){ // every 100 ticks do something, if timer is /100 or zero push new projectile
                projectiles.push(new Projectiles(this.x + 70, this.y + 35)); // projectiles coming from middle of blue box
                this.shootNow = false;
        //    }
      //  } else {
       //     this.timer = 0;
        }

    }
}

function handleDefenders(){
    for (let i = 0; i < defender.length; i++){
        defender[i].draw();
        defender[i].update();
        if (enemyPositions.indexOf(defender[i].y) !== -1){ // if value of index is 100, 200, 300, 400, 500 on vertical row enemy is here and you need to shoot it
            defender[i].shooting = true;
        } else {
            defender[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++){
            if (defender[i] && collision(defender[i], enemies[j])){
                enemies[j].movement = 0;
                defender[i].health -= 1;
            }
            if (defender[i] && defender[i].health <= 0){
                defender.splice(i, 1); // remove defender from game if health is zero
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}
const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85
}

const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85
}

function chooseDefender() {
    let card1stroke = 'black';
    let card2stroke = 'black';
    if (collision(mouse, card1) && mouse.clicked) {
    chosenDefender = 1;
    } else if (collision(mouse, card2) && mouse.clicked) {
        chosenDefender = 2;
    }
    if (chosenDefender === 1) {
        card1stroke = 'gold';
        card2stroke = 'black';
    } else if (chosenDefender === 2) {
        card1stroke = 'black';
        card2stroke = 'gold';
    } else {
        card1stroke = 'black';
        card2stroke = 'black';
    }


ctx.lineWidth = 1;
ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
ctx.strokeStyle = card1stroke;
ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
ctx.drawImage(defender1, 0, 0, 194, 194, 0, 5, 194/2, 194/2); // just hardcoded values, bcs these frames are static, they won't move
ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
ctx.drawImage(defender2, 0, 0, 194, 194, 80, 5, 194/2, 194/2);
ctx.strokeStyle = card2stroke;
ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);

}

// Enemies
const enemyTypes = []; // adding sprites to blue cubes
const enemy1 = new Image();
enemy1.src = 'images/enemy1.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = 'images/enemy2.png';
enemyTypes.push(enemy2);


class Enemy {
    constructor(verticalPosition){ //enemie on the same row as defender
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4; // game speed 0.4 is slow
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX = 0;
        this.frameY = 0; // this frame has only one row so the frame y will always be 0 which represents the first row
        this.minFrame = 0; // cycle through multiline spritesheets
        if (this.enemyType === enemy1) {
            this.maxFrame = 4; // max animations in a row, can be changed
        } else if (this.enemyType === enemy2){
            this.maxFrame = 7; // max animations in a row, can be changed
        }

        this.spriteWidth = 270; // png size
            this.spriteHeight = 270;

    }
    update(){
        this.x -= this.movement;
        if(frame % 10 === 0) { // slowing the sprites animation- % (modulus operator) checks if the first value is divisible by second value and return the remainder
            // ... npr. if current frame is 12, so frame modules 10 is 2, bcs 12 divided by 10 is 1 and we have 2 remainders to reach to 12
            // trigger this if statement if remainder is zero and will be true when frame variable that is ever increasing in site animation loop has values of 0, 10, 20, 30, 40...trigger this call only every ten cycles of animation loop
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }

    }
    draw(){
       // ctx.fillStyle = 'red'; // commenting this bcs we have sprites now
       // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        //ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); // where do we want to draw image- s= source, d= destination //
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0 ,
            this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height); // sy = 0 because it is single row sprite sheet
    }
}
function handleEnemies(){
    for (let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){ // if enemy get all the way to left side of the grid, it is game over
            gameOver = true;
        }
        if (enemies[i].health <= 0){ // remove enemy from game if the health is zero
            let gainedResources = enemies[i].maxHealth/10; // defender gets enemies resources when dies
            floatingMessages.push(new floatingMessage( '+' + gainedResources, enemies[i].x, enemies[i].y, 30, 'black'));
            floatingMessages.push(new floatingMessage( '+' + gainedResources, 470, 85, 30, 'gold'));
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y) // find enemies position on grid and remove it from the game
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
            //console.log(enemyPositions);
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore){ // every 600 intervals new enemy is added to board
        let verticalPosition = Math.floor(Math.random() * 5  + 1) * cellSize + cellGap; // enemie gets to one of the row of the grid. Had to add cellGap bcs enemies square was bigger than defender and shooting didn't start automatically...
        // grid is made of cells 100*100 px, 5+1 is 5 vertical cells plus one *cellSize which is 100px, vertical position will be random number, 500, 400, 200
        // which coresponds to vertical coordinates of our rows
        enemies.push(new Enemy(verticalPosition)); // create new enemy with constructor
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 50; // difficulty of game, increase the interval or decrease
       // console.log(enemyPositions);
    }


}
// Resources

const amounts = [20, 30, 40];
class Resource {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.amount, this.x + 15, this.y + 25);
    }
}
function handleResources(){
    if (frame % 500 === 0 && score < winningScore){
        resources.push(new Resource());
    }
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberOfResources += resources[i].amount;
            floatingMessages.push(new floatingMessage( '+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'black'));
            floatingMessages.push(new floatingMessage( '+' + resources[i].amount, 470, 85, 30, 'gold'));
            resources.splice(i, 1);
            i--;
        }
    }
}
// Utilities

function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score, 180, 40); // add points to score when enemy defeated (explanation for x and y- these are coordinates on which you move text in canvas)
    ctx.fillText('Resources: ' + numberOfResources, 180, 80); // add resources to defender when enemy defeated
    if (gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0){
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + ' points!', 134, 340); // 134, 340- coordinates to place text
    }
}
// Adding defenders on board
canvas.addEventListener('click', function(){ // adding defenders on board, checking if there is enough resources
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap; // now we have 3px gap and collision doesn't trigger on different rows, on edges of enemy and defender cell
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return; // if somebody clicks on the blue line, all the way on the top, nothing happends
    for (let i = 0; i < defender.length; i++){
        if (defender[i].x === gridPositionX && defender[i].y === gridPositionY)
            return; // prevents placing defenders on top of each other
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost){
        defender.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push(new floatingMessage('need more resources', mouse.x, mouse.y, 20, 'blue'));
    }
});

// Floating Messages

const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.05) this.opacity -= 0.03;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Orbitron';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages(){
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if(floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}



// REQURSION?? when function calls itself // Animate() is not a really a recursion,
//because it does not call itself. It calls a method requestAnimationFrame() which takes a function as argument, that will be called.
//If it were a real recursion calling itself, you will get a stack overflow at the 10.000th iteration in chrome based browsers.
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0, controlsBar.width, controlsBar.height);
    handleGameGrid(); // order in which we call function is important to what is drawn first and what comes on the top of it, have to think about layers in the game
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    // ctx.fillText('Resource: ' + numberOfResources, 20, 55);
    frame++;
    //console.log(frame); as the game runs frame increases by 1;
    if (!gameOver)requestAnimationFrame(animate); // REQURSION
}

animate();

function collision(first, second) {
    if (  !( first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)
    ) {
        return true;
    };


};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect(); // on resizing window mouse returns correct x and y coordinates
})
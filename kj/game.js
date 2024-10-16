const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');
const playerImage = document.getElementById('player-image');
const scoreSound = document.getElementById('score-sound');
const shootSound = document.getElementById('shoot-sound');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const pauseBtn = document.getElementById('pause-btn');
const mainMenu = document.getElementById('main-menu');
const kunBasketballMenu = document.getElementById('kun-basketball-menu');
const gameWrapper = document.getElementById('game-wrapper');
const startBtn = document.getElementById('start-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const backBtn = document.getElementById('back-btn');
const instructions = document.getElementById('instructions');
const kunBasketballBtn = document.getElementById('kun-basketball-btn');
const backToMainBtn = document.getElementById('back-to-main-btn');
const returnBtn = document.getElementById('return-btn');

canvas.width = 400;
canvas.height = 600;

// 在这里添加以下代码
function resizeCanvas() {
    const containerWidth = gameWrapper.clientWidth;
    const containerHeight = gameWrapper.clientHeight;
    const scale = Math.min(containerWidth / 400, containerHeight / 600);
    
    canvas.style.width = `${400 * scale}px`;
    canvas.style.height = `${600 * scale}px`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let isMovingLeft = false;
let isMovingRight = false;
let isMovingLeftKeyboard = false;
let isMovingRightKeyboard = false;

const player = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 140,
    width: 80,
    height: 130,
    speed: 12
};

const ball = {
    x: 0,
    y: 0,
    radius: 13,
    speed: 10,
    dy: 0,
    isShot: false
};

const hoop = {
    x: canvas.width / 2 - 40,
    y: 100,
    width: 80,
    height: 10,
    speed: 1,
    direction: 1
};

let score = 0;
let shootTimer = 0;

// 在文件开头添加这些行
console.log("scoreElement:", scoreElement);
scoreElement.textContent = "0";
console.log("Initial score set to:", scoreElement.textContent);

let isPaused = false;

function drawPlayer() {
    if (playerImage.complete) {
        const aspectRatio = playerImage.width / playerImage.height;
        const drawHeight = player.height;
        const drawWidth = drawHeight * aspectRatio;
        const xOffset = (drawWidth - player.width) / 2;
        ctx.drawImage(playerImage, player.x - xOffset, player.y, drawWidth, drawHeight);
    } else {
        console.log('Player image not yet loaded');
    }
}

function drawBall() {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawHoop() {
    // 绘制篮板
    ctx.fillStyle = 'white';
    ctx.fillRect(hoop.x - 10, hoop.y - 40, hoop.width + 20, 50);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(hoop.x - 10, hoop.y - 40, hoop.width + 20, 50);

    // 绘制篮筐
    ctx.beginPath();
    ctx.arc(hoop.x + hoop.width / 2, hoop.y + 10, hoop.width / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制篮网（简化版）
    ctx.beginPath();
    ctx.moveTo(hoop.x, hoop.y + 10);
    ctx.lineTo(hoop.x + 10, hoop.y + 40);
    ctx.lineTo(hoop.x + hoop.width - 10, hoop.y + 40);
    ctx.lineTo(hoop.x + hoop.width, hoop.y + 10);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function shootBall() {
    if (!ball.isShot) {
        ball.x = player.x + player.width / 2;
        ball.y = player.y;
        ball.dy = -ball.speed;
        ball.isShot = true;
        shootSound.play();  // 播放发射音效
    }
}

function moveBall() {
    if (ball.isShot) {
        ball.y += ball.dy;
        if (ball.y < 0) {
            resetBall();
        }
    }
}

function resetBall() {
    ball.isShot = false;
    ball.x = player.x + player.width / 2;
    ball.y = player.y;
    console.log("Ball reset");  // 添加日志
}

function moveHoop() {
    hoop.x += hoop.speed * hoop.direction;
    if (hoop.x <= 0 || hoop.x + hoop.width >= canvas.width) {
        hoop.direction *= -1;
    }
}

function checkCollision() {
    if (ball.isShot) {
        const hoopCenterX = hoop.x + hoop.width / 2;
        const hoopCenterY = hoop.y + 10;
        const hoopRadius = hoop.width / 2;
        
        const dx = ball.x - hoopCenterX;
        const dy = ball.y - hoopCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ball.radius + hoopRadius) {
            score++;
            scoreElement.textContent = score;
            console.log("Score! Current score:", score);
            scoreSound.play();  // 播放得分音效
            resetBall();
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isPaused) {
        if ((isMovingLeft || isMovingLeftKeyboard) && player.x > 0) {
            player.x -= player.speed;
        }
        if ((isMovingRight || isMovingRightKeyboard) && player.x < canvas.width - player.width) {
            player.x += player.speed;
        }
        
        shootTimer++;
        if (shootTimer >= 30) {
            shootBall();
            shootTimer = 0;
        }
        
        moveHoop();
        moveBall();
        checkCollision();
    }
    
    // 无论是否暂停，都绘制游戏元素
    drawHoop();
    drawPlayer();
    if (ball.isShot) {
        drawBall();
    }
    
    drawPauseScreen(); // 在每一帧都调用，以确保暂停屏幕在需要时显示
    
    requestAnimationFrame(gameLoop);
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseBtn.textContent = '继续';
    } else {
        pauseBtn.textContent = '暂停';
    }
    drawPauseScreen(); // 调用新的函数来绘制暂停屏幕
}

// 添加键盘事件监听器
document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        isMovingLeftKeyboard = true;
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        isMovingRightKeyboard = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // 防止空格键滚动页面
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        isMovingLeftKeyboard = false;
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        isMovingRightKeyboard = false;
    }
});

// 修改按钮事件监听器
leftBtn.addEventListener('mousedown', () => {
    isMovingLeft = true;
});

leftBtn.addEventListener('mouseup', () => {
    isMovingLeft = false;
});

leftBtn.addEventListener('mouseleave', () => {
    isMovingLeft = false;
});

rightBtn.addEventListener('mousedown', () => {
    isMovingRight = true;
});

rightBtn.addEventListener('mouseup', () => {
    isMovingRight = false;
});

rightBtn.addEventListener('mouseleave', () => {
    isMovingRight = false;
});

// 为触摸设备添加支持
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMovingLeft = true;
});

leftBtn.addEventListener('touchend', () => {
    isMovingLeft = false;
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMovingRight = true;
});

rightBtn.addEventListener('touchend', () => {
    isMovingRight = false;
});

pauseBtn.addEventListener('click', togglePause);

// 添加这些函数来处理菜单逻辑
function showMainMenu() {
    mainMenu.style.display = 'block';
    kunBasketballMenu.style.display = 'none';
    instructions.style.display = 'none';
    gameWrapper.style.display = 'none';
}

function showKunBasketballMenu() {
    mainMenu.style.display = 'none';
    kunBasketballMenu.style.display = 'block';
    instructions.style.display = 'none';
    gameWrapper.style.display = 'none';
}

function showInstructions() {
    mainMenu.style.display = 'none';
    kunBasketballMenu.style.display = 'none';
    instructions.style.display = 'block';
    gameWrapper.style.display = 'none';
}

function startGame() {
    mainMenu.style.display = 'none';
    kunBasketballMenu.style.display = 'none';
    instructions.style.display = 'none';
    gameWrapper.style.display = 'block';
    resetGame();
    resizeCanvas();
    isPaused = false; // 确保游戏开始时取消暂停状态
    gameLoop();
}

function resetGame() {
    score = 0;
    scoreElement.textContent = "0";
    player.x = canvas.width / 2 - player.width / 2;
    resetBall();
    isPaused = false;
}

// 添加事件监听器
kunBasketballBtn.addEventListener('click', showKunBasketballMenu);
startBtn.addEventListener('click', startGame);
instructionsBtn.addEventListener('click', showInstructions);
backBtn.addEventListener('click', showKunBasketballMenu);
backToMainBtn.addEventListener('click', showMainMenu);

// 初始显示主菜单
showMainMenu();

// 添加新的函数来绘制暂停屏幕
function drawPauseScreen() {
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
    }
}

// 添加这个函数来处理返回操作
function returnToMenu() {
    isPaused = true; // 暂停游戏
    showKunBasketballMenu(); // 返回到坤打篮球菜单
}

// 在事件监听器部分添加这行
returnBtn.addEventListener('click', returnToMenu);

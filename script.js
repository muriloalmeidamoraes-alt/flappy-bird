// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const startScreen = document.getElementById("start-screen");
const instructionsScreen = document.getElementById("instructions-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const startButton = document.getElementById("start-button");
const instructionsButton = document.getElementById("instructions-button");
const backButton = document.getElementById("back-button");

const restartButton = document.getElementById("restart-button");
const menuButton = document.getElementById("menu-button");

const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("final-score");
const bestScoreElement = document.getElementById("best-score");


// ========================================
// CANVAS
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// ========================================
// VARIÁVEIS DO JOGO
// ========================================

let bird;
let pipes;

let score = 0;

let bestScore = Number(
    localStorage.getItem("flappyBestScore")
) || 0;

let gameRunning = false;

let animationId;


// ========================================
// CONFIGURAÇÕES
// ========================================

const gravity = 0.42;
const jumpStrength = -7.5;

const pipeSpeed = 3;

const pipeWidth = 70;

const pipeGap = 155;

const pipeDistance = 260;


// ========================================
// AJUSTAR CANVAS
// ========================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// ========================================
// PASSARINHO
// ========================================

function createBird() {

    bird = {

        x: canvas.width * 0.25,

        y: canvas.height / 2,

        width: 42,

        height: 32,

        velocity: 0

    };

}


// ========================================
// CANOS
// ========================================

function createPipe(x) {

    const minimumTop = 80;

    const maximumTop =
        canvas.height - pipeGap - 120;

    const topHeight =
        Math.random() *
        (maximumTop - minimumTop) +
        minimumTop;

    return {

        x: x,

        topHeight: topHeight,

        bottomY: topHeight + pipeGap,

        width: pipeWidth,

        passed: false

    };

}


function createPipes() {

    pipes = [];

    pipes.push(
        createPipe(
            canvas.width + 150
        )
    );

}


// ========================================
// INICIAR JOGO
// ========================================

function startGame() {

    cancelAnimationFrame(animationId);

    startScreen.classList.add("hidden");
    instructionsScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    score = 0;

    scoreElement.textContent = score;

    createBird();

    createPipes();

    gameRunning = true;

    gameLoop();

}


// ========================================
// PULAR
// ========================================

function jump() {

    if (!gameRunning) {
        return;
    }

    bird.velocity = jumpStrength;

}


// Clique/toque na tela

canvas.addEventListener("pointerdown", function() {

    jump();

});


// Tecla Espaço

document.addEventListener("keydown", function(event) {

    if (
        event.code === "Space" &&
        gameRunning
    ) {

        event.preventDefault();

        jump();

    }

});


// ========================================
// ATUALIZAR PASSARINHO
// ========================================

function updateBird() {

    bird.velocity += gravity;

    bird.y += bird.velocity;

}


// ========================================
// ATUALIZAR CANOS
// ========================================

function updatePipes() {

    for (let pipe of pipes) {

        pipe.x -= pipeSpeed;


        // Verifica se o jogador passou pelo cano

        if (
            !pipe.passed &&
            pipe.x + pipe.width < bird.x
        ) {

            pipe.passed = true;

            score++;

            scoreElement.textContent = score;

        }

    }


    // Remove canos que saíram da tela

    pipes = pipes.filter(
        pipe => pipe.x + pipe.width > 0
    );


    // Cria novos canos

    if (
        pipes.length === 0 ||
        pipes[pipes.length - 1].x <
        canvas.width - pipeDistance
    ) {

        pipes.push(
            createPipe(
                canvas.width + 20
            )
        );

    }

}


// ========================================
// COLISÃO
// ========================================

function checkCollision() {

    // Chão

    if (
        bird.y + bird.height / 2 >=
        canvas.height
    ) {

        return true;

    }


    // Teto

    if (
        bird.y - bird.height / 2 <= 0
    ) {

        return true;

    }


    // Canos

    for (let pipe of pipes) {

        const birdLeft =
            bird.x - bird.width / 2;

        const birdRight =
            bird.x + bird.width / 2;

        const birdTop =
            bird.y - bird.height / 2;

        const birdBottom =
            bird.y + bird.height / 2;


        const pipeLeft = pipe.x;

        const pipeRight =
            pipe.x + pipe.width;


        const touchesPipeHorizontally =
            birdRight > pipeLeft &&
            birdLeft < pipeRight;


        const touchesTopPipe =
            birdTop < pipe.topHeight;


        const touchesBottomPipe =
            birdBottom > pipe.bottomY;


        if (
            touchesPipeHorizontally &&
            (
                touchesTopPipe ||
                touchesBottomPipe
            )
        ) {

            return true;

        }

    }


    return false;

}


// ========================================
// GAME OVER
// ========================================

function gameOver() {

    gameRunning = false;

    cancelAnimationFrame(animationId);

    finalScoreElement.textContent = score;


    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "flappyBestScore",
            bestScore
        );

    }

    bestScoreElement.textContent = bestScore;

    gameScreen.classList.add("hidden");

    gameOverScreen.classList.remove("hidden");

}


// ========================================
// DESENHAR CÉU
// ========================================

function drawBackground() {

    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(
        0,
        "#4ec9ff"
    );

    gradient.addColorStop(
        1,
        "#b9efff"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Nuvens

    drawCloud(
        canvas.width * 0.15,
        canvas.height * 0.18,
        0.8
    );

    drawCloud(
        canvas.width * 0.75,
        canvas.height * 0.30,
        0.6
    );


    // Chão

    ctx.fillStyle = "#72c23b";

    ctx.fillRect(
        0,
        canvas.height - 55,
        canvas.width,
        55
    );


    ctx.fillStyle = "#d7b24c";

    ctx.fillRect(
        0,
        canvas.height - 65,
        canvas.width,
        10
    );

}


function drawCloud(x, y, scale) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(255,255,255,0.8)";

    ctx.beginPath();

    ctx.arc(0, 15, 25, 0, Math.PI * 2);

    ctx.arc(30, 0, 35, 0, Math.PI * 2);

    ctx.arc(65, 15, 25, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();

}


// ========================================
// DESENHAR CANOS
// ========================================

function drawPipe(pipe) {

    const pipeGreen = "#58bd39";
    const pipeDark = "#3c9328";
    const pipeLight = "#8be05b";


    // Cano superior

    ctx.fillStyle = pipeGreen;

    ctx.fillRect(
        pipe.x,
        0,
        pipe.width,
        pipe.topHeight
    );


    // Parte clara

    ctx.fillStyle = pipeLight;

    ctx.fillRect(
        pipe.x + 8,
        0,
        12,
        pipe.topHeight
    );


    // Borda inferior do cano superior

    ctx.fillStyle = pipeDark;

    ctx.fillRect(
        pipe.x - 5,
        pipe.topHeight - 22,
        pipe.width + 10,
        22
    );


    // Cano inferior

    ctx.fillStyle = pipeGreen;

    ctx.fillRect(
        pipe.x,
        pipe.bottomY,
        pipe.width,
        canvas.height - pipe.bottomY
    );


    // Parte clara

    ctx.fillStyle = pipeLight;

    ctx.fillRect(
        pipe.x + 8,
        pipe.bottomY,
        12,
        canvas.height - pipe.bottomY
    );


    // Borda superior do cano inferior

    ctx.fillStyle = pipeDark;

    ctx.fillRect(
        pipe.x - 5,
        pipe.bottomY,
        pipe.width + 10,
        22
    );

}


// ========================================
// DESENHAR PASSARINHO
// ========================================

function drawBird() {

    ctx.save();

    ctx.translate(
        bird.x,
        bird.y
    );


    // Rotação baseada na velocidade

    let rotation =
        Math.min(
            Math.max(
                bird.velocity * 0.06,
                -0.5
            ),
            0.8
        );

    ctx.rotate(rotation);


    // Corpo

    ctx.fillStyle = "#ffd633";

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        21,
        16,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Asa

    ctx.fillStyle = "#f0ad18";

    ctx.beginPath();

    ctx.ellipse(
        -5,
        7,
        12,
        7,
        -0.4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Olho

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        10,
        -7,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle = "#222";

    ctx.beginPath();

    ctx.arc(
        12,
        -7,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Bico

    ctx.fillStyle = "#ff8c19";

    ctx.beginPath();

    ctx.moveTo(18, 0);

    ctx.lineTo(34, 5);

    ctx.lineTo(18, 9);

    ctx.closePath();

    ctx.fill();


    ctx.restore();

}


// ========================================
// LOOP PRINCIPAL
// ========================================

function gameLoop() {

    if (!gameRunning) {
        return;
    }


    updateBird();

    updatePipes();


    drawBackground();


    for (let pipe of pipes) {

        drawPipe(pipe);

    }


    drawBird();


    if (checkCollision()) {

        gameOver();

        return;

    }


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


// ========================================
// BOTÕES DA INTERFACE
// ========================================

startButton.addEventListener(
    "click",
    startGame
);


instructionsButton.addEventListener(
    "click",
    function() {

        startScreen.classList.add("hidden");

        instructionsScreen.classList.remove("hidden");

    }
);


backButton.addEventListener(
    "click",
    function() {

        instructionsScreen.classList.add("hidden");

        startScreen.classList.remove("hidden");

    }
);


restartButton.addEventListener(
    "click",
    startGame
);


menuButton.addEventListener(
    "click",
    function() {

        gameOverScreen.classList.add("hidden");

        startScreen.classList.remove("hidden");

    }
);


// ========================================
// MOSTRAR RECORDE INICIAL
// ========================================

bestScoreElement.textContent = bestScore;

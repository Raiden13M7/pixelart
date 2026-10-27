/*
   Pixal Arts and Entertainment
   Mouse Bird Game

   Filename: mouse_bird.js
*/


/* Canvas Setup */

const myCanvas = document.getElementById("myCanvas");
const restartButton = document.getElementById("restartButton");

if (!myCanvas || !restartButton) {
   throw new Error(
      "Mouse Bird requires #myCanvas and #restartButton in index.html."
   );
}

const ctx = myCanvas.getContext("2d");

if (!ctx) {
   throw new Error("Could not create the canvas drawing context.");
}

const WIDTH = myCanvas.width;
const HEIGHT = myCanvas.height;


/* Load Game Images */

function loadImage(src) {
   const img = new Image();
   img.src = src;
   return img;
}

const images = {
   bird: loadImage("bird.png"),
   pipe: loadImage("pipe.png"),
   bottom: loadImage("bottom.png"),
   background: loadImage("back.png"),
   end: loadImage("end.png")
};


/* Game Settings */

const GRAVITY = 0.25;
const FLAP_STRENGTH = -4.8;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 48;
const PIPE_GAP = 135;
const PIPE_INTERVAL = 95;

let bird;
let pipes;
let score;
let frame;
let gameState;
let groundX;


/* Bird Settings */

function createBird() {
   return {
      x: 75,
      y: HEIGHT / 2,
      width: 34,
      height: 26,
      velocity: 0
   };
}


/* Ground Settings */

function getGroundHeight() {
   const img = images.bottom;

   if (img.complete && img.naturalWidth > 0) {
      return Math.min(
         HEIGHT * 0.2,
         HEIGHT * img.naturalHeight / img.naturalWidth
      );
   }

   return 40;
}


/* Reset Game */

function resetGame() {
   bird = createBird();
   pipes = [];
   score = 0;
   frame = 0;
   groundX = 0;
   gameState = "ready";

   addPipe(WIDTH + 60);
   drawGame();
}


/* Add Pipes */

function addPipe(x) {
   const groundHeight = getGroundHeight();
   const margin = 45;
   const playableHeight = HEIGHT - groundHeight;

   const gapCenter =
      margin + PIPE_GAP / 2 +
      Math.random() *
      Math.max(
         0,
         playableHeight - PIPE_GAP - margin * 2
      );

   pipes.push({
      x: x,
      gapCenter: gapCenter,
      scored: false
   });
}


/* Bird Input */

function flap() {
   if (gameState === "over") {
      resetGame();
      gameState = "running";
   }

   if (gameState === "ready") {
      gameState = "running";
   }

   bird.velocity = FLAP_STRENGTH;
}

myCanvas.addEventListener("click", function () {
   flap();
});

myCanvas.addEventListener("touchstart", function (event) {
   event.preventDefault();
   flap();
}, { passive: false });

document.addEventListener("keydown", function (event) {
   if (event.code === "Space" && !event.repeat) {
      event.preventDefault();
      flap();
   }
});

restartButton.addEventListener("click", function () {
   resetGame();
});


/* Draw Background */

function drawBackground() {
   const img = images.background;

   if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
   } else {
      ctx.fillStyle = "#83d9ef";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
   }
}


/* Draw Bird */

function drawBird() {
   const img = images.bird;

   ctx.save();
   ctx.translate(bird.x, bird.y);

   const angle = Math.min(
      Math.PI / 4,
      Math.max(-Math.PI / 5, bird.velocity * 0.08)
   );

   ctx.rotate(angle);

   if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(
         img,
         -bird.width / 2,
         -bird.height / 2,
         bird.width,
         bird.height
      );
   } else {
      ctx.fillStyle = "#ffd447";
      ctx.beginPath();
      ctx.ellipse(
         0, 0,
         bird.width / 2,
         bird.height / 2,
         0, 0, Math.PI * 2
      );
      ctx.fill();
   }

   ctx.restore();
}


/* Draw Pipes - Bottom Pipe Rotated 180 Degrees */

function drawPipes() {
   const img = images.pipe;
   const groundHeight = getGroundHeight();

   pipes.forEach(function (pipe) {
      const gapTop = pipe.gapCenter - PIPE_GAP / 2;
      const gapBottom = pipe.gapCenter + PIPE_GAP / 2;

      if (img.complete && img.naturalWidth > 0) {

         // Bottom pipe: rotate the image 180 degrees
         const bottomHeight = Math.max(
            0,
            HEIGHT - groundHeight - gapBottom
         );

         ctx.save();
         ctx.translate(
            pipe.x + PIPE_WIDTH / 2,
            gapBottom + bottomHeight
         );
         ctx.rotate(Math.PI);

         ctx.drawImage(
            img,
            -PIPE_WIDTH / 2,
            0,
            PIPE_WIDTH,
            bottomHeight
         );

         ctx.restore();

         // Top pipe: original orientation
         ctx.drawImage(
            img,
            pipe.x,
            0,
            PIPE_WIDTH,
            Math.max(0, gapTop)
         );

      } else {
         // Fallback if pipe.png cannot load
         ctx.fillStyle = "#279447";
         ctx.strokeStyle = "#145c2a";
         ctx.lineWidth = 2;

         ctx.fillRect(
            pipe.x, 0, PIPE_WIDTH, gapTop
         );
         ctx.strokeRect(
            pipe.x, 0, PIPE_WIDTH, gapTop
         );

         ctx.fillRect(
            pipe.x,
            gapBottom,
            PIPE_WIDTH,
            Math.max(
               0,
               HEIGHT - groundHeight - gapBottom
            )
         );

         ctx.strokeRect(
            pipe.x,
            gapBottom,
            PIPE_WIDTH,
            Math.max(
               0,
               HEIGHT - groundHeight - gapBottom
            )
         );
      }
   });
}


/* Draw Ground */

function drawGround() {
   const img = images.bottom;
   const groundHeight = getGroundHeight();
   const groundY = HEIGHT - groundHeight;

   if (img.complete && img.naturalWidth > 0) {
      const tileWidth =
         groundHeight * img.naturalWidth / img.naturalHeight;

      if (tileWidth > 0) {
         let x = -(groundX % tileWidth);

         while (x < WIDTH) {
            ctx.drawImage(
               img,
               x,
               groundY,
               tileWidth,
               groundHeight
            );

            x += tileWidth;
         }
      }
   } else {
      ctx.fillStyle = "#d6b45a";
      ctx.fillRect(
         0,
         groundY,
         WIDTH,
         groundHeight
      );
   }
}


/* Draw Score */

function drawScore() {
   ctx.fillStyle = "#ffffff";
   ctx.strokeStyle = "#333333";
   ctx.lineWidth = 3;
   ctx.font = "bold 30px Arial";
   ctx.textAlign = "center";

   ctx.strokeText(score, WIDTH / 2, 45);
   ctx.fillText(score, WIDTH / 2, 45);
}


/* Draw Messages */

function drawMessage(title, subtitle) {
   const img = images.end;

   if (
      title === "Game Over!" &&
      img.complete &&
      img.naturalWidth > 0
   ) {
      const imageWidth = Math.min(
         WIDTH - 30,
         img.naturalWidth
      );

      const imageHeight =
         imageWidth * img.naturalHeight / img.naturalWidth;

      ctx.drawImage(
         img,
         (WIDTH - imageWidth) / 2,
         (HEIGHT - imageHeight) / 2 - 35,
         imageWidth,
         imageHeight
      );

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
         20,
         HEIGHT / 2 + 35,
         WIDTH - 40,
         45
      );

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
         subtitle,
         WIDTH / 2,
         HEIGHT / 2 + 62
      );

      return;
   }

   ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
   ctx.fillRect(
      15,
      HEIGHT / 2 - 55,
      WIDTH - 30,
      110
   );

   ctx.textAlign = "center";
   ctx.fillStyle = "#ffffff";
   ctx.font = "bold 25px Arial";
   ctx.fillText(
      title,
      WIDTH / 2,
      HEIGHT / 2 - 12
   );

   ctx.font = "14px Arial";
   ctx.fillText(
      subtitle,
      WIDTH / 2,
      HEIGHT / 2 + 18
   );
}


/* Collision Detection */

function checkCollision() {
   const groundHeight = getGroundHeight();

   // Ceiling and ground
   if (
      bird.y - bird.height / 2 <= 0 ||
      bird.y + bird.height / 2 >= HEIGHT - groundHeight
   ) {
      return true;
   }

   // Pipes
   for (const pipe of pipes) {
      const gapTop = pipe.gapCenter - PIPE_GAP / 2;
      const gapBottom = pipe.gapCenter + PIPE_GAP / 2;

      const birdLeft = bird.x - bird.width / 2;
      const birdRight = bird.x + bird.width / 2;
      const birdTop = bird.y - bird.height / 2;
      const birdBottom = bird.y + bird.height / 2;

      const overlapsPipe =
         birdRight > pipe.x &&
         birdLeft < pipe.x + PIPE_WIDTH;

      if (
         overlapsPipe &&
         (birdTop < gapTop || birdBottom > gapBottom)
      ) {
         return true;
      }
   }

   return false;
}


/* Update Game */

function updateGame() {
   if (gameState !== "running") {
      return;
   }

   frame++;

   // Bird physics
   bird.velocity += GRAVITY;
   bird.y += bird.velocity;

   // Add pipes
   if (frame % PIPE_INTERVAL === 0) {
      addPipe(WIDTH);
   }

   // Move pipes and award points
   pipes.forEach(function (pipe) {
      pipe.x -= PIPE_SPEED;

      if (
         !pipe.scored &&
         pipe.x + PIPE_WIDTH < bird.x
      ) {
         pipe.scored = true;
         score++;
      }
   });

   // Remove pipes off screen
   pipes = pipes.filter(function (pipe) {
      return pipe.x + PIPE_WIDTH > 0;
   });

   // Move ground
   groundX += PIPE_SPEED;

   // Check collisions
   if (checkCollision()) {
      gameState = "over";
   }
}


/* Draw Game */

function drawGame() {
   ctx.clearRect(0, 0, WIDTH, HEIGHT);

   drawBackground();
   drawPipes();
   drawGround();
   drawBird();
   drawScore();

   if (gameState === "ready") {
      drawMessage(
         "Mouse Bird",
         "Click or press SPACE to start"
      );
   }

   if (gameState === "over") {
      drawMessage(
         "Game Over!",
         "Click or press SPACE to retry"
      );
   }
}


/* Main Game Loop */

function gameLoop() {
   updateGame();
   drawGame();
   requestAnimationFrame(gameLoop);
}


/* Start Game */

resetGame();
gameLoop();
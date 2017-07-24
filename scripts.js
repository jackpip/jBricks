var canvas, canvasContext;
var mouseX, mouseY;
var ballX = 75;
var ballY = 75;
var ballRadius = 10;
var ballSpeedX = 5;
var ballSpeedY = 5;
var paddleX = 400;
var paused = false;

const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_COLS = 10;
const BRICK_ROWS = 14;
const BRICK_GAP = 2;
const GUTTER_ROWS = 3;
const TOTAL_ROWS = BRICK_ROWS+GUTTER_ROWS;
var brickGrid = new Array(BRICK_COLS);
var bricksLeft = 0;

const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 50;

window.onload = function() {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');

  var framesPerSecond = 30;
  setInterval(updateAll, 1000/framesPerSecond);

  canvas.addEventListener('mousemove', updateMousePos);
  document.addEventListener('keypress', pauseHandler);

  brickReset();
  ballReset();
}

function updateAll() {
  moveAll();
  drawAll();
}

function ballMove() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if(ballX < 0 && ballSpeedX < 0.0) {
    ballSpeedX *= -1;
  }
  if(ballX > canvas.width && ballSpeedX > 0.0) {
    ballSpeedX *= -1;
  }
  if(ballY < 0 && ballSpeedY < 0.0) {
    ballSpeedY *= -1;
  }
  if(ballY > canvas.height) {
    ballReset();
  }
}

function pauseHandler(e) {
  if (e.keyCode == 32)
    paused = !paused;
}

function ballBrickHandling() {
  var ballBrickCol = Math.floor(ballX / BRICK_W);
  var ballBrickRow = Math.floor(ballY / BRICK_H);
  var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

  if (ballBrickCol >=0 && ballBrickCol < BRICK_COLS &&
      ballBrickRow >=0 && ballBrickRow < TOTAL_ROWS) {
    if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
      brickGrid[brickIndexUnderBall] = false;
      bricksLeft--;

      var prevBallX = ballX - ballSpeedX;
      var prevBallY = ballY - ballSpeedY;
      var prevBrickCol = Math.floor(prevBallX / BRICK_W);
      var prevBrickRow = Math.floor(prevBallY / BRICK_H);

      var bothTestsFailed = true;

      if (prevBrickCol != ballBrickCol) {
        if (!isBrickAtColRow(prevBrickCol, ballBrickRow)) {
          ballSpeedX *= -1;
          bothTestsFailed = false;
        }
      }
      if (prevBrickRow != ballBrickRow) {
        if (!isBrickAtColRow(ballBrickCol, prevBrickRow)) {
          ballSpeedY *= -1;
          bothTestsFailed = false;
        }
      }
      if (bothTestsFailed) {
        ballSpeedX *= -1;
        ballSpeedY *= -1;
      }
    }
  }
}

function ballPaddleHandling() {
  var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
  var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
  var paddleLeftEdgeX = paddleX;
  var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;
  var closestX = clamp(ballX, paddleLeftEdgeX, paddleRightEdgeX);
  var closestY = clamp(ballY, paddleTopEdgeY, paddleBottomEdgeY);
  var distanceX = ballX - closestX;
  var distanceY = ballY - closestY;
  var distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  if (distanceSquared < (ballRadius * ballRadius) && ballSpeedY > 0) {
    ballSpeedY *= -1;
    var centerOfPaddleX = paddleX + PADDLE_WIDTH/2;
    var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
    ballSpeedX = ballDistFromPaddleCenterX/3;
    //console.log(bricksLeft);
    if (bricksLeft == 0) {
      brickReset();
    }
  }
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function moveAll() {
  if (paused) {
    return;
  }
  ballMove();
  ballBrickHandling();
  ballPaddleHandling();
}

function drawAll(){
  colorRect(0, 0, canvas.width, canvas.height, 'black');
  colorCircle(ballX, ballY, ballRadius, 'white');
  colorRect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white');
  drawBricks();

  //colorText(mouseBrickCol+","+mouseBrickRow+":"+brickIndexUnderMouse, mouseX, mouseY, 'yellow');
}

function drawBricks() {
  for (var r = 0; r < TOTAL_ROWS; r++) {
    for (var c = 0; c < BRICK_COLS; c++) {
      var arrayIndex = BRICK_COLS * r + c;
      if (brickGrid[arrayIndex]) {
        colorRect(BRICK_W*c, BRICK_H*r, BRICK_W-BRICK_GAP, BRICK_H-BRICK_GAP, 'blue');
      }
    }
  }
}

function ballReset() {
  ballX = canvas.width/2;
  ballY = 350;
}

function brickReset() {
  bricksLeft = 0;
  for (var i = 0; i < BRICK_COLS*TOTAL_ROWS; i++) {
    //brickGrid[i] = Math.random() < 0.5 ? true : false;
    if (i < GUTTER_ROWS*BRICK_COLS) {
      brickGrid[i] = false;
    } else {
      brickGrid[i] = true;
      bricksLeft++;
    }
  }
}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX, centerY, radius, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
  canvasContext.fill();
}

function colorText(showWords, textX, textY, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillText(showWords, textX, textY);
}

function updateMousePos(e) {
  if (paused) {
    return;
  }
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  mouseX = e.clientX - rect.left - root.scrollLeft;
  mouseY = e.clientY - rect.top - root.scrollTop;
  paddleX = mouseX - PADDLE_WIDTH/2;

  //cheat
  /*ballX = mouseX;
  ballY = mouseY;
  ballSpeedX = 5;
  ballSpeedY = -5; */
}

function isBrickAtColRow(col, row) {
  if (col >= 0 && col < BRICK_COLS &&
      row >= 0 && row < TOTAL_ROWS) {
    var brickIndexUnderCoord = rowColToArrayIndex(col, row);
    return brickGrid[brickIndexUnderCoord];
  } else {
    return false;
  }
}

function rowColToArrayIndex(col, row) {
  return col + BRICK_COLS * row;
}

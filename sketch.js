var potions = [[], [], [], [], [], [], [], []];

// Image Variables
var backgroundImage;
var potionImages = [];
var boardImage;
var collectedAnimation;

// Sound Variables
var bgmSound;
var collectedSound = [];

// Game Management Variables
var clickedX = 0;
var clickedY = 0;
var movingTimer = 0;
var gameMode = "gamePlaying";
var angle = 0;
var score = 0;
var timer = 5;

function preload() {
  for (var i = 0; i < 5; i++) {
    potionImages[i] = loadImage(`./images/potion${i + 1}.png`);
    collectedSound[i] = loadSound(`./sound/positive${i + 1}.wav`);
  }
  bgmSound = loadSound('./sound/background.wav');
  backgroundImage = loadImage("./images/background.jpg");
  collectedAnimation = loadAnimation(
    "./images/sparkle/burst0001.png",
    "./images/sparkle/burst0060.png"
  );
}

function setup() {
  createCanvas(745, 600);

  bgmSound.loop();
  // Setup Text
  fill(255, 250, 220);
  textFont("bevan");
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(50);

  createBoard();
}

function draw() {
  background(backgroundImage);
  text("TIMER", 95, 50);
  text(timer, 95, 120);
  text("SCORE", 650, 50);
  text(score, 650, 120);

  drawSprites();

  switch (gameMode) {
    case "gamePlaying":
      gamePlaying();
      break;
    case "gameClickedFirstPotion":
      gameClickedFirstPotion();
      break;
    case "gameMoving":
      gameMoving();
      break;
    case "gameFinished":
      gameFinished();
      break;
  }
}

function createBoard() {
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      var potion = createSprite(getPositionX(i), getPositionY(j));

      for (
        var colorNumber = 0;
        colorNumber < potionImages.length;
        colorNumber++
      ) {
        potion.addImage("color" + colorNumber, potionImages[colorNumber]);
      }

      potion.colorNumber = floor(random(5));
      potion.changeImage("color" + potion.colorNumber);

      potion.cellX = i;
      potion.cellY = j;

      potion.onMousePressed = potionClicked;

      potions[j][i] = potion;
    }
  }
}

function potionClicked(potion) {
  switch (gameMode) {
    case "gamePlaying":
      clickedX = potion.cellX;
      clickedY = potion.cellY;
      gameMode = "gameClickedFirstPotion";
      break;
    case "gameClickedFirstPotion":
      // Return the potion to it's original size
      potions[clickedY][clickedX].scale = 1;
      if (isNeighbor(clickedX, clickedY, potion.cellX, potion.cellY)) {
        var colorNumber1 = potions[clickedY][clickedX].colorNumber;
        var colorNumber2 = potion.colorNumber;
        setPotionInformation(
          potion.cellX,
          potion.cellY,
          clickedX,
          clickedY,
          colorNumber1
        );
        setPotionInformation(
          clickedX,
          clickedY,
          potion.cellX,
          potion.cellY,
          colorNumber2
        );
        movingTimer = 30;
        gameMode = "gameMoving";
      } else {
        gameMode = "gamePlaying";
      }
      break;
  }
}

// Validates that potions are neighbors
function isNeighbor(x1, y1, x2, y2) {
  if (x1 == x2) {
    if (y1 == y2 - 1 || y1 == y2 + 1) {
      return true;
    }
  } else if (y1 == y2) {
    if (x1 == x2 - 1 || x1 == x2 + 1) {
      return true;
    }
  } else {
    return false;
  }
}

// Set the potion information (from -> to)
function setPotionInformation(toX, toY, fromX, fromY, fromColorNumber) {
  // Set the color information
  potions[toY][toX].colorNumber = fromColorNumber;
  // Change the images
  potions[toY][toX].changeImage("color" + fromColorNumber);
  // Switch the position
  potions[toY][toX].position.x = getPositionX(fromX);
  potions[toY][toX].position.y = getPositionY(fromY);
  // Set the velocity
  potions[toY][toX].velocity.x = (getPositionX(toX) - getPositionX(fromX)) / 30;
  potions[toY][toX].velocity.y = (getPositionY(toY) - getPositionY(fromY)) / 30;
}

function gamePlaying() {
  if (timer <= 0) {
    gameMode = "gameFinished";
  }
}

function gameClickedFirstPotion() {
  // Change the angle and size
  angle += 0.1;
  potions[clickedY][clickedX].scale = 1 + sin(angle) * 0.1;
}

function gameMoving() {
  movingTimer--;

  if (movingTimer == 0) {
    stopAllPotions();
    // Detect when three or more potions are lined up vert or horiz and raise a flag
    setCollectedFlag();
    // Count the collected potions
    var collectedPotionsCount = countCollectedPotions();
    // Check if potions are collected
    if (collectedPotionsCount > 0) {
      score += collectedPotionsCount * 10;
      // Display effect when potions are collected
      createCollectedEffect();
      // Drop
      collectPotions();
      movingTimer = 30;
    } else {
      gameMode = "gamePlaying";
    }
  }
}

function stopAllPotions() {
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      // Set velocity to 0
      potions[j][i].velocity.x = 0;
      potions[j][i].velocity.y = 0;
      // Arange the positons
      potions[j][i].position.x = getPositionX(i);
      potions[j][i].position.y = getPositionY(j);
    }
  }
}

function setCollectedFlag() {
  // Set all flags to false
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      potions[j][i].isCollected = false;
    }
  }
  // Check all potions for vert or horiz
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      // If there are 3 or more horiz, set flags to true
      if (isSameHorizontal(i, j)) {
        potions[j][i].isCollected = true;
        potions[j][i + 1].isCollected = true;
        potions[j][i + 2].isCollected = true;
      }
      if (isSameVertical(i, j)) {
        potions[j][i].isCollected = true;
        potions[j + 1][i].isCollected = true;
        potions[j + 2][i].isCollected = true;
      }
    }
  }
}

function isSameHorizontal(x, y) {
  if (x < 6) {
    if (potions[y][x].colorNumber == potions[y][x + 1].colorNumber) {
      if (potions[y][x + 1].colorNumber == potions[y][x + 2].colorNumber) {
        return true;
      }
    }
  }
}

function isSameVertical(x, y) {
  if (y < 6) {
    if (potions[y][x].colorNumber == potions[y + 1][x].colorNumber) {
      if (potions[y + 1][x].colorNumber == potions[y + 2][x].colorNumber) {
        return true;
      }
    }
  }
}

function countCollectedPotions() {
  var count = 0;
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      if (potions[j][i].isCollected) {
        count++;
      }
    }
  }
  return count;
}

function createCollectedEffect() {
  // Play Collected Sound
  collectedSound[floor(random(5))].play();

  // Make a sparkle effect
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      if (potions[j][i].isCollected) {
        // Make a sparkle effect sprite in the place of collected potions
        var effect = createSprite(getPositionX(i), getPositionY(j) + 8);
        // Add an animation to the sparkle effect
        effect.addAnimation("collected", collectedAnimation);
        // Set how long the sprite is displayed
        effect.life = 40;
      }
    }
  }
}

// Erase collected potions and line up more
function collectPotions() {
  for (var i = 0; i < 8; i++) {
    var collectedCount = 0;
    for (var j = 7; j >= 0; j--) {
      if (potions[j][i].isCollected) {
        collectedCount++;
      } else {
        setPotionInformation(
          i,
          j + collectedCount,
          i,
          j,
          potions[j][i].colorNumber
        );
      }
    }
    for (var j = 0; j < collectedCount; j++) {
      setPotionInformation(i, j, i, j - collectedCount, floor(random(5)));
    }
  }
}

function getPositionX(cellX) {
  return 190 + 55 * cellX;
}

function getPositionY(cellY) {
  return 70 + 65 * cellY;
}

function gameFinished() {
  background(0, 0, 0, 120);
  text("Finished!", width / 2, height / 2);
  text(score, width / 2, height / 2 + 60);
}

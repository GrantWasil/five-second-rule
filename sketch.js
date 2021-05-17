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
var gameMode = 'gamePlaying';

function preload() {
  for (var i = 0; i < 5; i++){
    potionImages[i] = loadImage(`./images/potion${i+1}.png`); 
  }
  for (var i = 0; i < 3; i++){
    collectedSound[i] = loadSound(`./sound/positive${i+1}.wav`);
  }
  backgroundImage = loadImage('./images/background.jpg');
  collectedAnimation = loadAnimation('./images/sparkle/burst0001.png', './images/sparkle/burst0060.png');
}

function setup() {
  createCanvas(745, 600);
  
  createBoard();
}

function draw() {
  background(backgroundImage);
  drawSprites();

  switch(gameMode){
    case 'gamePlaying':
      gamePlaying();
      break;
    case 'gameClickedFirstPotion':
      gameClickedFirstPotion();
      break;
    case 'gameMoving':
      gameMoving();
      break;
  }
}

function createBoard() {
  for (var j = 0; j < 8; j++){
    for (var i = 0; i < 8; i++){
      var potion = createSprite(getPositionX(i), getPositionY(j));

      for (var colorNumber = 0; colorNumber < potionImages.length; colorNumber++){
       potion.addImage('color' + colorNumber, potionImages[colorNumber]);
      }

      potion.colorNumber = floor(random(5));
      potion.changeImage('color' + potion.colorNumber);

      potion.cellX = i;
      potion.cellY = j;

      potion.onMousePressed = potionClicked;

      potions[j][i] = potion;
    }
  }
}

function potionClicked(potion){
  switch(gameMode) {
    case 'gamePlaying':
      clickedX = potion.cellX;
      clickedY = potion.cellY;
      gameMode = 'gameClickedFirstPotion';
      break;
    case 'gameClickedFirstPotion':
      var colorNumber1 = potions[clickedY][clickedX].colorNumber;
      var colorNumber2 = potion.colorNumber;
      setPotionInformation(potion.cellX, potion.cellY, clickedX, clickedY, colorNumber1);
      setPotionInformation(clickedX, clickedY, potion.cellX, potion.cellY, colorNumber2);
      movingTimer = 30;
      gameMode = 'gameMoving';
      break;
  }
}

// Set the potion information (from -> to)
function setPotionInformation(toX, toY, fromX, fromY, fromColorNumber){
  // Set the color information
  potions[toY][toX].colorNumber = fromColorNumber;
  // Change the images
  potions[toY][toX].changeImage('color' + fromColorNumber);
  // Switch the position 
  potions[toY][toX].position.x = getPositionX(fromX);
  potions[toY][toX].position.y = getPositionY(fromY);
  // Set the velocity
  potions[toY][toX].velocity.x = (getPositionX(toX) - getPositionX(fromX)) / 30;
  potions[toY][toX].velocity.y = (getPositionY(toY) - getPositionY(fromY)) / 30;
}

function gamePlaying() {

}

function gameClickedFirstPotion(){

}

function gameMoving() {
  movingTimer--;

  if (movingTimer == 0) {
    stopAllPotions();

    // Display effect when gems are collected
    createCollectedEffect();

    gameMode = 'gamePlaying';
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

function createCollectedEffect() {
  // Play Collected Sound
  collectedSound[floor(random(3))].play();

  // Make a sparkle effect
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      // Make a sparkle effect sprite in the place of collected gems
      var effect = createSprite(getPositionX(i), getPositionY(j));
      // Add an animation to the sparkle effect
      effect.addAnimation('collected', collectedAnimation);
      // Set how long the sprite is displayed (it will automatically disappear)
      effect.life = 30;
    }
  }
}

function getPositionX(cellX) {
  return 190 + 54 * cellX;
}

function getPositionY(cellY) {
  return 70 + 64 * cellY;
}
import {TileSize, toIndex} from './tileresolution.js';

// Layers are not what they sound like, in this project layers are functions
// which draw the actual tile/sprite graphical layers to a context.

// Need to think of a nice way of recreating the collision box layer.

const FontSize = 8;
const Line1 = FontSize;
const Line2 = 2 * FontSize;

export function createHUDLayer(hudTileSet, level) {
  const marioTextCanvas = createTextCanvas('MARIO', hudTileSet);
  const worldTextCanvas = createTextCanvas('WORLD', hudTileSet);
  const timeTextCanvas = createTextCanvas('TIME', hudTileSet);

  const miniTextCanvases = new Map();
  ['100', '200', '500', '800'].forEach(score => {
    miniTextCanvases.set(score, createTextCanvas(score, hudTileSet, 'miniWhite'));
  });

  const hudAnimations = level.animations.get('hud');

  function animateSpinningCoin(coinAnimationInfo, context, camera) {
    coinAnimationInfo.frame++;
    if (coinAnimationInfo.frame >= 1 && coinAnimationInfo.frame <= 10)
      coinAnimationInfo.yPos -= 2;
    else if (coinAnimationInfo.frame >= 11 && coinAnimationInfo.frame <= 15)
      coinAnimationInfo.yPos -= 1;
    else if (coinAnimationInfo.frame >= 16 && coinAnimationInfo.frame <= 20)
      coinAnimationInfo.yPos += 1;
    else if (coinAnimationInfo.frame >= 21 && coinAnimationInfo.frame <= 30) {
      coinAnimationInfo.yPos += 2;
      if (coinAnimationInfo.frame === 30) {
        hudAnimations.push({
          type: 'score',
          points: '200',
          xPos: coinAnimationInfo.xPos + 2,
          yPos: coinAnimationInfo.yPos,
          frame: 0
        });
      }
    }
    else
      level.removeAnimation('hud', coinAnimationInfo);

    hudTileSet.drawAnimation('spinningCoin', context,
      coinAnimationInfo.xPos - camera.xPos, coinAnimationInfo.yPos, level.totalTime);
  }

  function animateRisingText(scoreAnimationInfo, context, camera) {  
    scoreAnimationInfo.frame++;
    if (scoreAnimationInfo.frame >= 1 && scoreAnimationInfo.frame <= 30)
      scoreAnimationInfo.yPos -= 1;
    else
      level.removeAnimation('hud', scoreAnimationInfo);

    context.drawImage(miniTextCanvases.get(scoreAnimationInfo.points),
      scoreAnimationInfo.xPos - camera.xPos, scoreAnimationInfo.yPos);
  }

  return (context, camera) => {
    context.drawImage(marioTextCanvas, 3 * FontSize, Line1);
    const score = addUpPointsCollected(level.entities);
    printText(score.toString().padStart(6, '0'), context, 3 * FontSize, Line2, hudTileSet);

    context.drawImage(worldTextCanvas, 32 * FontSize, Line1);
    printText(level.name, context, 33 * FontSize, Line2, hudTileSet);

    const numCoins = addUpCoinsCollected(level.entities);
    hudTileSet.drawAnimation('smallCoin', context, 18 * FontSize, Line2, level.totalTime);
    hudTileSet.draw('times', context, 19 * FontSize, Line2);
    printText(numCoins.toString().padStart(2, '0'), context, 20 * FontSize, Line2, hudTileSet);

    context.drawImage(timeTextCanvas, 45 * FontSize, Line1);
    const time = 400 - Math.floor(2 * level.totalTime);     // need to know rate time flows in Super Mario Bros.
    printText(time.toString().padStart(3, '0'), context, 46 * FontSize, Line2, hudTileSet);

    hudAnimations.forEach(animationInfo => {
      if (animationInfo.type === 'coin')
        animateSpinningCoin(animationInfo, context, camera);
      else if (animationInfo.type === 'score')
        animateRisingText(animationInfo, context, camera);
      else {
        console.log('Unhandled HUD animation:', animationInfo)
        level.removeAnimation('hud', animationInfo);
      }
    });
  };
}

function createTextCanvas(string, hudTileSet, modifier = '') {
  const textBuffer = document.createElement('canvas');
  textBuffer.height = FontSize;
  textBuffer.width = [...string].reduce((bufferWidth, character) => {
    const tileSetCharacterBuffer = hudTileSet.tiles.get(modifier + character)[0];
    return bufferWidth + tileSetCharacterBuffer.width;
  }, 0);

  let xDrawPos = 0;
  const textBufferContext = textBuffer.getContext('2d');
  [...string].forEach((character, index) => {
    const tileSetCharacterBuffer = hudTileSet.tiles.get(modifier + character)[0];
    textBufferContext.drawImage(tileSetCharacterBuffer, xDrawPos, 0);
    xDrawPos += tileSetCharacterBuffer.width;
  });

  return textBuffer;
}

function printText(text, context, xPos, yPos, spriteSet) {
  [...text].forEach((character, index) => {
    spriteSet.draw(character, context, xPos + index * FontSize, yPos);
  });
}

// At the moment we just add up the total coins from all coin collectors but may
// want to display individual scores later, since coins collected is part of the
// entity and not the level we have the flexibility to do this
function addUpCoinsCollected(entities) {
  const coinTotaller = (runningCoinTotal, entity) => {
    return runningCoinTotal + (entity.collector ? entity.collector.coinsCollected : 0);
  };

  return entities.reduce(coinTotaller, 0);
}

// Also have the option of initialising the level with the total number of points
// scored by each entity and then adding to a running total in the level class
// instead of calculating every frame
function addUpPointsCollected(entities) {
  const pointTotaller = (runningPointTotal, entity) => {
    return runningPointTotal + (entity.scoresPoints ? entity.scoresPoints.pointsScored : 0);
  };

  return entities.reduce(pointTotaller, 0);
}


export function createBackgroundColourLayer(backgroundColour) {
  return (context, camera) => {
    context.fillStyle = backgroundColour;
    context.fillRect(0, 0, 26 * 16 + 16, 15 * 16);
  };
}


export function createBackgroundLayer(level, tileSet) {
  const backgroundBuffer = document.createElement('canvas');
  backgroundBuffer.width = 26 * 16 + 16;    // Remove the + 16 later
  backgroundBuffer.height = 15 * 16;

  const backgroundContext = backgroundBuffer.getContext('2d');

  function drawBackgroundSubrange(startIndex, endIndex) {
    backgroundContext.clearRect(0, 0, backgroundBuffer.width, backgroundBuffer.height);
    for (let x = startIndex; x <= endIndex; ++x) {
      const column = level.tiles.grid[x];
      if (column) {
        column.forEach((tile, y) => {
          if (tileSet.animations.has(tile.name)) {
            tileSet.drawAnimation(tile.name, backgroundContext,
              tile.xPos - startIndex * TileSize, tile.yPos, level.totalTime);
          }
          else
           tileSet.draw(tile.name, backgroundContext, tile.xPos - startIndex * TileSize, tile.yPos);
        });
      }
    }
  }

  return (context, camera) => {
    const drawWidth = toIndex(camera.width);
    const startIndex = toIndex(camera.xPos);
    const endIndex = startIndex + drawWidth;

    drawBackgroundSubrange(startIndex, endIndex);
    context.drawImage(backgroundBuffer, -camera.xPos % 16, 0);
  };
}


export function createSpriteLayer(entities) {
  return (context, camera) => {
    entities.forEach(entity => entity.draw(context, camera));
  };
}


export function createCameraLayer(cameraToDraw) {
  return (context, fromCamera) => {
    context.strokeStyle = 'purple';
    context.beginPath();
    context.rect(cameraToDraw.xPos - fromCamera.xPos,
      0, cameraToDraw.width, cameraToDraw.height);
    context.stroke();
  }
}

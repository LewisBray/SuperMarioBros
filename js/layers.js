import {TileSize, toIndex} from './tileresolution.js';

// Layers are not what they sound like, in this project layers are functions
// which draw the actual tile/sprite graphical layers to a context.

// Need to think of a nice way of recreating the collision box layer.

const FontSize = 8;
const Line1 = FontSize;
const Line2 = 2 * FontSize;

export function createHUDLayer(hudTileSet, level) {
  return (context, camera) => {
    printText('MARIO', context, 3 * FontSize, Line1, hudTileSet);
    const score = addUpPointsCollected(level.entities);
    printText(score.toString().padStart(6, '0'), context, 3 * FontSize, Line2, hudTileSet);

    printText('WORLD', context, 32 * FontSize, Line1, hudTileSet);
    printText(level.name, context, 33 * FontSize, Line2, hudTileSet);

    const numCoins = addUpCoinsCollected(level.entities);
    hudTileSet.drawAnimation('smallCoin', context, 18 * FontSize, Line2, level.totalTime);
    hudTileSet.draw('times', context, 19 * FontSize, Line2);
    printText(numCoins.toString().padStart(2, '0'), context, 20 * FontSize, Line2, hudTileSet);

    printText('TIME', context, 45 * FontSize, Line1, hudTileSet);
    const time = 400 - Math.floor(2 * level.totalTime);     // need to know rate time flows in Super Mario Bros.
    printText(time.toString().padStart(3, '0'), context, 46 * FontSize, Line2, hudTileSet);
  };
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

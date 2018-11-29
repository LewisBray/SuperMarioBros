
// Layers are not what they sound like, in this project layers are functions
// which draw the actual tile/sprite graphical layers to a context.  These
// functions are created and then added to an array of layers in the compositor.

const fontSize = 8;
const Line1 = fontSize;
const Line2 = 2 * fontSize;

export function createHUDLayer(font, level) {
  return (context, camera) => {
    font.print('MARIO', context, 3 * 8, Line1);
    const score = 0;
    font.print(score.toString().padStart(6, '0'), context, 3 * 8, Line2);

    font.print('WORLD', context, 32 * 8, Line1);
    font.print(level.name, context, 33 * 8, Line2);

    const numCoins = addUpCoinsCollected(level.entities);
    font.print('@x' + numCoins.toString().padStart(2, '0'), context, 18 * 8, Line2);  // use coin instead of '@'

    font.print('TIME', context, 45 * 8, Line1);
    const time = 400 - Math.floor(2 * level.totalTime);     // need to know rate time flows in Super Mario Bros.
    font.print(time.toString().padStart(3, '0'), context, 46 * 8, Line2);
  };
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


export function createBackgroundColourLayer(backgroundColour) {
  return (context, camera) => {
    context.fillStyle = backgroundColour;
    context.fillRect(0, 0, 26 * 16 + 16, 15 * 16);
  };
}


export function createBackgroundLayer(level, tiles, tileSet) {
  const backgroundBuffer = document.createElement('canvas');
  backgroundBuffer.width = 26 * 16 + 16;    // Remove the + 16 later
  backgroundBuffer.height = 15 * 16;

  const backgroundContext = backgroundBuffer.getContext('2d');

  // Not sure if I even want this function, the background buffers for the entire
  // level don't strike me as being a ridiculous size and it results in less code
  // and maybe even better performance once the background is all loaded into memory
  function drawBackgroundSubrange(startIndex, endIndex) {
    backgroundContext.clearRect(0, 0, backgroundBuffer.width, backgroundBuffer.height);
    for (let x = startIndex; x <= endIndex; ++x) {
      const column = tiles.grid[x];
      if (column) {
        column.forEach((tile, y) => {
          if (tileSet.animations.has(tile.name))
            tileSet.drawAnimation(tile.name, backgroundContext, x - startIndex, y, level.totalTime);
          else
           tileSet.drawTile(tile.name, backgroundContext, x - startIndex, y);
        });
      }
    }
  }

  const tileResolver = level.tileCollider.tiles;
  return (context, camera) => {
    const drawWidth = tileResolver.toIndex(camera.size.x);
    const startIndex = tileResolver.toIndex(camera.pos.x);
    const endIndex = startIndex + drawWidth;

    drawBackgroundSubrange(startIndex, endIndex);
    context.drawImage(backgroundBuffer, -camera.pos.x % 16, -camera.pos.y);
  };
}


export function createSpriteLayer(entities) {
  return (context, camera) => {
    entities.forEach(entity => entity.draw(context, camera));
  };
}


export function createCollisionLayer(level) {
  const drawCollisionBoxes = createCollisionBoxLayer(level.entities);
  const drawCollisionCandidateTileBoxes =
    createCollisionCandidateTilesLayer(level.tileCollider.tiles);

  return (context, camera) => {
    drawCollisionCandidateTileBoxes(context, camera);
    drawCollisionBoxes(context, camera);
  };
}

function createCollisionCandidateTilesLayer(tileResolver) {
  const resolvedTiles = [];
  const tileSize = tileResolver.tileSize;

  const getByIndexOriginal = tileResolver.getByIndex;
  tileResolver.getByIndex = function(x, y) {
    resolvedTiles.push({x, y});
    return getByIndexOriginal.call(tileResolver, x, y);
  }

  return (context, camera) => {
    context.strokeStyle = 'blue';
    resolvedTiles.forEach(({x, y}) => {
      context.beginPath();
      context.rect(x * tileSize - camera.pos.x,
        y * tileSize - camera.pos.y,
        tileSize, tileSize);
      context.stroke();
    });

    resolvedTiles.length = 0;
  };
}

function createCollisionBoxLayer(entities) {
  return (context, camera) => {
    context.strokeStyle = 'red';
    entities.forEach(entity => {
      context.beginPath();
      context.rect(entity.collisionBox.left - camera.pos.x,
        entity.collisionBox.top - camera.pos.y,
        entity.collisionBox.right - entity.collisionBox.left,
        entity.collisionBox.bottom - entity.collisionBox.top);
      context.stroke();
    });
  };
}


export function createCameraLayer(cameraToDraw) {
  return (context, fromCamera) => {
    context.strokeStyle = 'purple';
    context.beginPath();
    context.rect(cameraToDraw.pos.x - fromCamera.pos.x,
      cameraToDraw.pos.y - fromCamera.pos.y,
      cameraToDraw.size.x, cameraToDraw.size.y);
    context.stroke();
  }
}

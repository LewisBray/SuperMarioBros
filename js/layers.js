
// Layers are not what they sound like, in this project layers are functions
// which draw the actual tile/sprite graphical layers to a context.  These
// functions are created and then added to an array of layers in the compositor.

export function createBackgroundLayer(level, tileSet) {
  const backgroundBuffer = document.createElement('canvas');
  backgroundBuffer.width = 26 * 16 + 16;    // Remove the + 16 later
  backgroundBuffer.height = 15 * 16;

  const backgroundContext = backgroundBuffer.getContext('2d');
  // Not sure if I even want this function, the background buffers for the entire
  // level don't strike me as being a ridiculous size and it results in less code
  // and maybe even better performance once the background is all loaded into memory
  function drawBackgroundSubrange(startIndex, endIndex) {
    // Clears the buffer so we don't get multiple copies of a sprite next to each other
    backgroundContext.fillStyle = level.backgroundColour;
    backgroundContext.fillRect(0, 0, screen.width, screen.height);

    for (let x = startIndex; x <= endIndex; ++x) {
      const column = level.tiles.grid[x];
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

    // Filling the background with colour here results in multiple copies of sprites when
    // scrolling, not sure what the difference is between putting it in drawBackgroundSubrange
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
  const resolvedTiles = [];

  const tileResolver = level.tileCollider.tiles;
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

    context.strokeStyle = 'red';
    level.entities.forEach(entity => {
      context.beginPath();
      context.rect(entity.pos.x - camera.pos.x,
        entity.pos.y - camera.pos.y,
        entity.width, entity.height);
      context.stroke();
    })

    resolvedTiles.length = 0;
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

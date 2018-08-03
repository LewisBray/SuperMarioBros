
// Layers are not what they sound like, in this project layers are functions
// which draw the actual tile/sprite graphical layers to a context.  These
// functions are created and then added to an array of layers in the compositor.

export function createBackgroundLayer(level, tileSet) {
  const backgroundBuffer = document.createElement('canvas');
  backgroundBuffer.width = 25 * 16;
  backgroundBuffer.height = 14 * 16;

  const context = backgroundBuffer.getContext('2d');
  level.tiles.forEach((tile, x, y) => tileSet.drawTile(tile.name, context, x, y));

  return context => context.drawImage(backgroundBuffer, 0, 0);
}


export function createSpriteLayer(entities) {
  return context => entities.forEach(entity => entity.draw(context));
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

  return context => {
    context.strokeStyle = 'blue';
    resolvedTiles.forEach(({x, y}) => {
      context.beginPath();
      context.rect(x * tileSize, y * tileSize, tileSize, tileSize);
      context.stroke();
    });

    context.strokeStyle = 'red';
    level.entities.forEach(entity => {
      context.beginPath();
      context.rect(entity.pos.x, entity.pos.y, entity.width, entity.height);
      context.stroke();
    })

    resolvedTiles.length = 0;
  };
}

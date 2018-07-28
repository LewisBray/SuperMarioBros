
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


// Used for creating mini canvases that have sprites
// drawn to them and then drawing them given a context
export default class SpriteSet {
  constructor(sourceImage, spriteWidth, spriteHeight) {
    this.sourceImage = sourceImage;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.tiles = new Map();   // For looking up sprite canvases by name
  }

  define(name, x, y, spriteWidth, spriteHeight) {
    const spriteBuffer = document.createElement('canvas');
    spriteBuffer.width = spriteWidth;
    spriteBuffer.height = spriteHeight;

    spriteBuffer.getContext('2d')
      .drawImage(this.sourceImage,
        x, y, spriteWidth, spriteHeight,
        0, 0, spriteWidth, spriteHeight);

      this.tiles.set(name, spriteBuffer);
  }

  defineTile(name, x, y) {
    this.define(name,
      this.spriteWidth * x, this.spriteHeight * y,
      this.spriteWidth, this.spriteHeight);
  }

  draw(name, context, x, y) {
    const spriteBuffer = this.tiles.get(name);
    context.drawImage(spriteBuffer, x, y);
  }

  drawTile(name, context, x, y) {
    this.draw(name, context, this.spriteWidth * x, this.spriteHeight * y);
  }
};

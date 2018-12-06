
// Used for creating mini canvases that have sprites
// drawn to them and then drawing them given a context
export default class SpriteSet {
  constructor(sourceImage, spriteWidth, spriteHeight) {
    this.sourceImage = sourceImage;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.tiles = new Map();   // For looking up sprite canvases by name
    this.animations = new Map();
  }

  define(name, x, y, spriteWidth, spriteHeight) {
    const spriteBuffers = [false, true].map(mirrorSprite => {
      const spriteBuffer = document.createElement('canvas');
      spriteBuffer.width = spriteWidth;
      spriteBuffer.height = spriteHeight;

      const bufferContext = spriteBuffer.getContext('2d');

      if (mirrorSprite) {
        bufferContext.scale(-1, 1);
        bufferContext.translate(-spriteBuffer.width, 0);
      }

      bufferContext.drawImage(this.sourceImage,
          x, y, spriteWidth, spriteHeight,
          0, 0, spriteWidth, spriteHeight);

      return spriteBuffer;
    });

    this.tiles.set(name, spriteBuffers);
  }

  defineTile(name, x, y) {
    this.define(name,
      this.spriteWidth * x, this.spriteHeight * y,
      this.spriteWidth, this.spriteHeight);
  }

  defineAnimation(name, animFrameSelector) {
    this.animations.set(name, animFrameSelector);
  }

  draw(name, context, x, y, mirrorSprite = false) {
    const spriteBuffer = this.tiles.get(name)[mirrorSprite ? 1 : 0];
    context.drawImage(spriteBuffer, x, y);
  }

  drawTile(name, context, x, y) {
    this.draw(name, context, this.spriteWidth * x, this.spriteHeight * y);
  }

  drawAnimation(name, context, x, y, distance) {
    const animFrameSelector = this.animations.get(name);
    this.draw(animFrameSelector(distance), context, x, y);
  }
};

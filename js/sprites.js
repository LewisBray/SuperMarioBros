import SpriteSet from './spriteset.js';
import {loadImage} from './loaders.js';


export function createBackgroundTiles() {
  return loadImage('js/images/tileset.png').then(image => {
    const tileSet = new SpriteSet(image, 16, 16);
    tileSet.defineTile('ground', 0, 0);
    tileSet.defineTile('sky', 3, 23);

    return tileSet;
  });
}


export function createMarioSprites() {
  return loadImage('js/images/characters.gif').then(image => {
    const marioSprites = new SpriteSet(image, 16, 16);
    marioSprites.define('idle', 276, 44, 16, 16);

    return marioSprites;
  });
}

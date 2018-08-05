import SpriteSet from './spriteset.js';
import {loadImage} from './loaders.js';


export function createMarioSprites() {
  return loadImage('js/images/characters.gif').then(image => {
    const marioSprites = new SpriteSet(image, 16, 16);
    marioSprites.define('idle', 276, 44, 16, 16);

    return marioSprites;
  });
}

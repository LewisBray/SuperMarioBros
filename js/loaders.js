import Font from './font.js';
import SpriteSet from './spriteset.js';
import {loadMario} from './mario.js';
import {loadGoomba} from './goomba.js';
import {loadKoopa} from './koopa.js';
import {loadCoin} from './coin.js';
import {animFrameSelectorFactory} from './animation.js';
import {createBackgroundColourLayer, createBackgroundLayer,
  createSpriteLayer, createCameraLayer, createHUDLayer} from './layers.js';


export function loadImage(url) {
  return new Promise(resolve => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.src = url;
  });
}


export function loadJSON(url) {
  return fetch(url).then(file => file.json());
}


const loadableCharacters =
  ' !"#$%&\'()*+,-./' +
  '0123456789:;<=>?' +
  '@ABCDEFGHIJKLMNO' +
  'PQRSTUVWXYZ[\\]^_' +
  '`abcdefghijklmno' +
  'pqrstuvwxyz{¦}~|';

export function loadFont() {
  return loadImage('./js/images/fontset.png')
  .then(fontSetImage => {
    const fontSet = new SpriteSet(fontSetImage);

    const size = 8;
    const imageWidth = fontSetImage.width;
    for (let [index, character] of [...loadableCharacters].entries()) {
      const xPos = index * size % imageWidth;
      const yPos = Math.floor(index * size / imageWidth) * size;
      fontSet.define(character, xPos, yPos, size, size);
    }

    return new Font(fontSet, size);
  });
}


// This needs to be made more elegant and more thought put into JSON format so it
// works for both character sprites and level tiles.
export function loadSpriteSet(name, spriteWidth = 16, spriteHeight = 16) {
  return loadJSON(name)
  .then(spritesSpec => Promise.all([spritesSpec, loadImage(spritesSpec.imageURL)]))
  .then(([spritesSpec, tileSetImage]) => {
    const tileSet = new SpriteSet(tileSetImage, spriteWidth, spriteHeight);

    if (spritesSpec.tiles) {
      spritesSpec.tiles.forEach(tile => {
        tileSet.define(tile.name,
          tile.location[0] * spritesSpec.xScale,
          tile.location[1] * spritesSpec.yScale,
          spriteWidth, spriteHeight);             // needs to be specified in JSON?
      });
    }

    if (spritesSpec.animations) {
      spritesSpec.animations.forEach(animationSpec => {
        const animFrameSelector =
          animFrameSelectorFactory(animationSpec.frames, animationSpec.frameLength);

        tileSet.defineAnimation(animationSpec.name, animFrameSelector);
      });
    }

    return tileSet;
  });
}


export function loadEntities() {
  const entityFactory = {};
  
  function addEntity(name) {
    return factory => {
      entityFactory[name] = factory;
    };
  }

  return Promise.all([
    loadMario().then(addEntity('mario')),
    loadGoomba().then(addEntity('goomba')),
    loadKoopa().then(addEntity('koopa')),
    loadCoin().then(addEntity('coin'))
  ])
  .then(() => {
    return entityFactory;
  });
}


export function loadLayersToDraw(level, levelSpec, camera) {
  return Promise.all(([
    loadSpriteSet(`/js/tilesets/${levelSpec.tileSet}.json`),
    loadFont()
  ]))
  .then(([levelTileSet, fontSet]) => {
    const layers = [];
    layers.push(createBackgroundColourLayer(levelSpec.backgroundColour));
    layers.push(createBackgroundLayer(level, levelTileSet));
    layers.push(createSpriteLayer(level.entities));
    layers.push(createCameraLayer(camera));
    layers.push(createHUDLayer(fontSet, level));
  
    return layers;
  });
}

import SpriteSet from './spriteset.js';
import {loadMario} from './entities/mario.js';
import {loadGoomba} from './entities/goomba.js';
import {loadKoopa} from './entities/koopa.js';
import {loadCoin} from './entities/coin.js';
import {loadSuperMushroom} from './entities/supermushroom.js';
import {loadFlower} from './entities/flower.js';
import {loadPowerStar} from './entities/powerstar.js';
import {createBackgroundColourLayer, createBackgroundLayer,
  createSpriteLayer, createCameraLayer, createHUDLayer} from './layers.js';
import { load1Up } from './entities/1-up.js';


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


export function loadSpriteSet(spritesSpec) {
  return Promise.all([spritesSpec, loadImage(spritesSpec.imageURL)])
  .then(([spritesSpec, tileSetImage]) => {
    const tileSet = new SpriteSet(tileSetImage);

    const xScale = spritesSpec.xScale;
    const yScale = spritesSpec.yScale;

    if (spritesSpec.tiles) {
      spritesSpec.tiles.forEach(tile => {
        tileSet.define(tile.name,
          tile.location[0] * xScale,
          tile.location[1] * yScale,
          (tile.width) ? tile.width : xScale,
          (tile.height) ? tile.height : yScale);
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

function animFrameSelectorFactory(frames, frameLength) {
  return distance => {
    const frameIndex = Math.floor(distance / frameLength) % frames.length;
    return frames[frameIndex];
  };
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
    loadCoin().then(addEntity('coin')),
    loadSuperMushroom().then(addEntity('superMushroom')),
    loadFlower().then(addEntity('flower')),
    loadPowerStar().then(addEntity('powerStar')),
    load1Up().then(addEntity('1-up'))
  ])
  .then(() => {
    return entityFactory;
  });
}


export function loadLayersToDraw(level, levelSpec, camera) {
  return Promise.all(([
    loadJSON(`/js/specifications/tilesets/${levelSpec.tileSet}.json`),
    loadJSON(`/js/specifications/hud.json`)
  ]))
  .then(([tilesSpec, hudSpec, fontSet]) => Promise.all([
    loadSpriteSet(tilesSpec),
    loadSpriteSet(hudSpec, 8, 8),
  ]))
  .then(([levelTileSet, hudTileSet]) => {
    const layers = [];
    layers.push(createBackgroundColourLayer(levelSpec.backgroundColour));
    layers.push(createBackgroundLayer(level, 'scenery', levelTileSet));
    layers.push(createSpriteLayer(level.entities));
    layers.push(createBackgroundLayer(level, 'collision', levelTileSet));
    layers.push(createHUDLayer(hudTileSet, level));
    layers.push(createCameraLayer(camera));
  
    return layers;
  });
}

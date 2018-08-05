import Level from './level.js';
import SpriteSet from './spriteset.js';
import {createBackgroundLayer, createSpriteLayer} from './layers.js';


// Functions which load resources and return promises so we
// can load everything in parallel at the start of a level

export function loadImage(url) {
  return new Promise(resolve => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.src = url;
  });
}


export function loadLevel(name) {
  return loadJSON(`/js/levels/${name}.json`)
  .then(levelSpec => Promise.all([
    levelSpec,
    loadTileSet(`/js/tilesets/${levelSpec.tileSet}.json`)
  ]))
  .then(([levelSpec, tileSet]) => {
    const level = new Level(levelSpec.backgroundColour);

    createTileGrid(level, levelSpec.backgrounds);

    level.compositor.layers.push(createBackgroundLayer(level, tileSet));
    level.compositor.layers.push(createSpriteLayer(level.entities));

    return level;
  });
}


function createTileGrid(level, backgrounds) {
  backgrounds.forEach(background => {
    background.ranges.forEach(([x1, x2, y1, y2]) => {
      for (let x = x1; x < x2; ++x)
        for (let y = y1; y < y2; ++y)
          level.tiles.set(x, y, {name: background.tile, type: background.type});
    });
  });
}


function loadJSON(url) {
  return fetch(url).then(file => file.json());
}


function loadTileSet(name) {
  return loadJSON(name)
  .then(tilesSpec => Promise.all([tilesSpec, loadImage(tilesSpec.imageURL)]))
  .then(([tilesSpec, tileSetImage]) => {
    const tileSet = new SpriteSet(tileSetImage, tilesSpec.tileWidth, tilesSpec.tileHeight);
    tilesSpec.tiles.forEach(tile => {
      tileSet.defineTile(tile.name, tile.location[0], tile.location[1]);
    });
      return tileSet;
    });
}

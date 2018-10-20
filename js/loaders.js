import Level from './level.js';
import SpriteSet from './spriteset.js';
import {Matrix} from './maths.js';
import {animFrameSelectorFactory} from './animation.js';
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
    loadSpriteSet(`/js/tilesets/${levelSpec.tileSet}.json`)
  ]))
  .then(([levelSpec, tileSet]) => {
    const level = new Level(levelSpec.backgroundColour);

    const mergedLayerTiles = levelSpec.layers.reduce((tiles, layer) => {
      return tiles.concat(layer.tiles);
    }, []);
    const collisionGrid = createCollisionGrid(mergedLayerTiles, levelSpec.patterns);
    level.setCollisionGrid(collisionGrid);

    levelSpec.layers.forEach(layer => {
      const backgroundGrid = createBackgroundGrid(layer.tiles, levelSpec.patterns);
      level.compositor.layers.push(createBackgroundLayer(level, backgroundGrid, tileSet));
    });

    level.compositor.layers.push(createSpriteLayer(level.entities));

    return level;
  });
}


function createCollisionGrid(tiles, patterns) {
  const grid = new Matrix();

  for (const {x, y, tile} of expandTiles(tiles, patterns))
    grid.set(x, y, {type: tile.type});

  return grid;
}


function createBackgroundGrid(tiles, patterns) {
  const grid = new Matrix();

  for (const {x, y, tile} of expandTiles(tiles, patterns))
    grid.set(x, y, {name: tile.name});

  return grid;
}


function expandTiles(tiles, patterns) {
  const expandedTiles = [];

  function walkThroughTiles(tiles, xOffset, yOffset) {
    tiles.forEach(tile => {
      if (tile.pattern) {
        const patternTiles = patterns[tile.pattern].tiles;
        tile.positions.forEach(([x, y]) => {
          walkThroughTiles(patternTiles, x, y);
        });
      }
      else {
        tile.ranges.forEach(range => {
          for (const {x, y} of generateCoords(range))
            expandedTiles.push({x: x + xOffset, y: y + yOffset, tile});
        });
      }
    });
  }

  walkThroughTiles(tiles, 0, 0);

  return expandedTiles;
}


function* generateCoords(range) {
  const [xStart, xEnd, yStart, yEnd] = range;
  for (let x = xStart; x < xEnd; ++x)
    for (let y = yStart; y < yEnd; ++y)
      yield {x, y};
}


function loadJSON(url) {
  return fetch(url).then(file => file.json());
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

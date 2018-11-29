import Font from './font.js';
import Level from './level.js';
import SpriteSet from './spriteset.js';
import {Matrix} from './maths.js';
import {loadMario} from './mario.js';
import {loadGoomba} from './goomba.js';
import {loadKoopa} from './koopa.js';
import {loadCoin} from './coin.js';
import {animFrameSelectorFactory} from './animation.js';
import {createBackgroundColourLayer, createBackgroundLayer, createSpriteLayer} from './layers.js';


export function loadImage(url) {
  return new Promise(resolve => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.src = url;
  });
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


export function createLevelLoader(entityFactory) {
  return levelName => {
    return loadJSON(`/js/levels/${levelName}.json`)
    .then(levelSpec => Promise.all([
      levelSpec,
      loadSpriteSet(`/js/tilesets/${levelSpec.tileSet}.json`)
    ]))
    .then(([levelSpec, tileSet]) => {
      const level = new Level();
      level.name = levelName;

      setupCollisionDetection(levelSpec, level);
      setupBackgrounds(levelSpec, level, tileSet);
      setupEntities(levelSpec, level, entityFactory);

      return level;
    });
  };
}


function setupCollisionDetection(levelSpec, level) {
  const mergedLayerTiles = levelSpec.layers.reduce((tiles, layer) => {
    return tiles.concat(layer.tiles);
  }, []);
  const collisionGrid = createCollisionGrid(mergedLayerTiles, levelSpec.patterns);
  level.setCollisionGrid(collisionGrid);
}


function setupBackgrounds(levelSpec, level, tileSet) {
  level.compositor.layers.push(createBackgroundColourLayer(levelSpec.backgroundColour));

  levelSpec.layers.forEach(layer => {
    const backgroundGrid = createBackgroundGrid(layer.tiles, levelSpec.patterns);
    level.compositor.layers.push(createBackgroundLayer(level, backgroundGrid, tileSet));
  });
}


function setupEntities(levelSpec, level, entityFactory) {
  levelSpec.entities.forEach(entity => {
    const createEntity = entityFactory[entity.name];
    entity.positions.forEach(([x, y]) => {
      
      const newEntity = createEntity();
      newEntity.pos.x = x;
      newEntity.pos.y = y;
      
      level.entities.push(newEntity);
    });
  });

  level.compositor.layers.push(createSpriteLayer(level.entities));
}


function createCollisionGrid(tiles, patterns) {
  const grid = new Matrix();

  for (const {x, y, tile} of generateTiles(tiles, patterns))
    grid.set(x, y, {type: tile.type});

  return grid;
}


function createBackgroundGrid(tiles, patterns) {
  const grid = new Matrix();

  for (const {x, y, tile} of generateTiles(tiles, patterns))
    grid.set(x, y, {name: tile.name});

  return grid;
}


function* generateTiles(tiles, patterns) {
  function* walkThroughTiles(tiles, xOffset, yOffset) {
    for (const tile of tiles) {
      if (tile.pattern) {
        const patternTiles = patterns[tile.pattern].tiles;
        for (const [x, y] of tile.positions)
          yield* walkThroughTiles(patternTiles, x, y);
      }
      else {
        for (const range of tile.ranges)
          for (const {x, y} of generateCoords(range))
            yield {x: x + xOffset, y: y + yOffset, tile};
      }
    }
  }

  yield* walkThroughTiles(tiles, 0, 0);
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

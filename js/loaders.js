import Level from './level.js';
import {createBackgroundTiles} from './sprites.js';
import {createBackgroundLayer, createSpriteLayer, createCollisionLayer} from './layers.js';


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
  return Promise.all([
    fetch(`js/levels/${name}.json`).then(file => file.json()),
    createBackgroundTiles()
  ])
  .then(([levelSpec, tileSet]) => {
    const level = new Level();

    createTileGrid(level, levelSpec.backgrounds);

    level.compositor.layers.push(createBackgroundLayer(level, tileSet));
    level.compositor.layers.push(createSpriteLayer(level.entities));
    level.compositor.layers.push(createCollisionLayer(level));

    return level;
  });
}

function createTileGrid(level, backgrounds) {
  backgrounds.forEach(background => {
    background.ranges.forEach(([x1, x2, y1, y2]) => {
      for (let x = x1; x < x2; ++x)
        for (let y = y1; y < y2; ++y)
          level.tiles.set(x, y, {name: background.tile});
    });
  });
}

import {Matrix} from './maths.js';
import {TileSize} from './tileresolution.js';


// Handles all aspects of a level (background, entities, etc...)
export default class Level {
  constructor() {
    this.name = '';
    this.length = 0;
    this.gravity = 1500;
    this.totalTime = 0;
    this.entities = [];
    this.revivableEntities = [];
    this.audio = new Map();
    this.tiles = new Map();

    this.animations = new Map();
    ['tiles', 'hud'].forEach(layer => {
      this.animations.set(layer, []);
    });
  }

  update(deltaTime) {
    this.entities.forEach(entity => {
      entity.update(deltaTime, this);
    });

    this.revivableEntities.forEach(entity => {
      entity.revivable.update(entity, deltaTime, this);
    });

    this.animations.get('tiles').forEach(tileInfo => this.bumpTile(tileInfo));

    // if (this.totalTime < 150)
    //   this.audio.get('mainTheme').play();
    // else {
    //   this.audio.get('mainTheme').pause();
    //   this.audio.get('panicTheme').play();
    // }

    this.totalTime += deltaTime;
  }

  bumpTile(tileInfo) {
    tileInfo.frame++;

    // should this animation be defined in JSON, not sure it needs to be if it's a one off
    if (tileInfo.frame >= 1 && tileInfo.frame <= 3)
      tileInfo.tile.yPos -= 2;
    else if (tileInfo.frame >= 4 && tileInfo.frame <= 6) {
      tileInfo.tile.yPos += 2;
      if (tileInfo.frame === 6) {
        if (tileInfo.tile.name === 'question')
          tileInfo.tile.name = 'bumpedBlock';
        this.removeAnimation('tiles', tileInfo);
      }
    }
  }

  findTile(name) {
    let tileToFind = null;
    this.tiles.get('scenery').forEach(tile => {
      if (tile.name === name)
        tileToFind = tile;
    });

    if (tileToFind)
      return tileToFind;

    this.tiles.get('collision').forEach(tile => {
      if (tile.name === name)
        tileToFind = tile;
    });

    return tileToFind;
  }

  removeAnimation(layer, animationInfo) {
    const animationLayer = this.animations.get(layer);
    const animationIndex = animationLayer.indexOf(animationInfo);
    animationLayer.splice(animationIndex, 1);
  }

  removeEntity(entity) {
    if (entity.revivable)
      this.revivableEntities.push(entity);

    const entityIndex = this.entities.indexOf(entity);
    this.entities.splice(entityIndex, 1);
  }

  reviveEntity(entity) {
    if (!this.revivableEntities.includes(entity))
      return;
    
    entity.killable.dead = false;
    entity.killable.timeDead = 0;
    entity.pos.y = 32;
    entity.vel.x = 0;
    entity.vel.y = 0;

    this.entities.push(entity);

    const entityIndex = this.revivableEntities.indexOf(entity);
    this.revivableEntities.splice(entityIndex, 1);
  }
}


export function createLevel(levelName, levelSpec, entityFactory) {
  const level = new Level();
  level.name = levelName;
  level.length = levelSpec.length;

  level.tiles.set('scenery', createTileGrid(levelSpec.sceneryLayer.tiles, levelSpec.patterns));
  level.tiles.set('collision', createTileGrid(levelSpec.collisionLayer.tiles, levelSpec.patterns));

  levelSpec.audio.forEach(audio => {
    level.audio.set(audio.name, new Audio(`/js/music/level/${audio.file}.mp3`));
  });

  setupEntities(levelSpec, level, entityFactory);

  const flagTile = level.findTile('flag');
  if (flagTile)
    flagTile.xPos += TileSize / 2;  // flag isn't in correct place due to how level tiles are loaded
  
  return level;
}


function createTileGrid(tiles, patterns) {
  const grid = new Matrix();
  for (const {x, y, tile} of generateTiles(tiles, patterns))
    grid.set(x, y, {name: tile.name, type: tile.type, xPos: x * TileSize, yPos: y * TileSize});

  return grid;
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



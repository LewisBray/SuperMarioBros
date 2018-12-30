import {TileSize, toIndex, searchByRange} from './tileresolution.js';

// Traits are mini classes that each handle the logic for an
// individual trait an entity can have, the Entity class then
// loops all over all of these during the update of the entity

// Base class for traits to inherit from
export class Trait {
  constructor(name) {
    this.name = name;
  }

  tileCollision(entity, side, tileCollidedWith, candidateCollisionTiles) {
    // Empty so traits don't have to be implemented if not necessary
  }

  entityCollision(us, them) {

  }

  update(entity, deltaTime, level) {
    
  }
}


// The class in its current form draws a 1 frame animation when
// Mario jumps in a 1 block high area, this should be fixed later
export class Jump extends Trait {
  constructor() {
    super('jump');

    this.ready = true;
    this.isJumping = false;
    this.requestTime = 0;
    this.gracePeriod = 1 / 60;
    this.duration = 0.3;
    this.velocity = 200;
    this.engageTime = 0;
    this.speedBoost = 0.22;
  }

  start() {
    this.requestTime = this.gracePeriod;
  }

  cancel() {
    this.engageTime = 0;
    this.requestTime = 0;
  }

  tileCollision(entity, side, tileCollidedWith, candidateCollisionTiles) {
    if (side === 'below') {
      this.ready = true;
      this.isJumping = false;
    }
    else if (side === 'above')
      this.cancel();
  }

  update(entity, deltaTime, level) {
    if (this.requestTime > 0) {
      if (this.ready) {
        this.engageTime = this.duration;
        this.isJumping = true;
        entity.playAudio('jump');
      }

      this.requestTime -= deltaTime;
    }

    if (this.engageTime > 0) {
      entity.vel.y = -(this.velocity + Math.abs(entity.vel.x) * this.speedBoost);
      this.engageTime -= deltaTime;
    }

    this.ready = false;
  }
}


export class Move extends Trait {
  constructor() {
    super('move');

    this.direction = 0;
    this.acceleration = 400;
    this.deceleration = 300;
    this.dragFactor = 1/5000;
    this.distance = 0;
    this.heading = 1;
  }

  update(entity, deltaTime, level) {
    const absXVel = Math.abs(entity.vel.x);

    if (this.direction !== 0) {
      entity.vel.x += this.direction * this.acceleration * deltaTime;

      if (entity.jump) {
        if (!entity.jump.isJumping) {
          this.heading = this.direction;
        }
      }
      else
        this.heading = this.direction;
    }
    else if (entity.vel.x !== 0) {
      const slowDown = Math.min(absXVel, this.deceleration * deltaTime);
      entity.vel.x += (entity.vel.x > 0) ? -slowDown : slowDown;
    }
    else
      this.distance = 0;

    const drag = this.dragFactor * entity.vel.x * absXVel;
    entity.vel.x -= drag;

    this.distance += absXVel * deltaTime;
  }
}


export class SimpleAI extends Trait {
  constructor(speed) {
    super('aiWalk');

    this.speed = speed;
    this.preDisableSpeed = speed;
  }

  tileCollision(entity, side, tileCollidedWith, candidateCollisionTiles) {
    if (side === 'left' || side === 'right')
      this.speed *= -1;
  }

  update(entity, deltaTime, level) {
    entity.vel.x = this.speed;
  }

  enable() {
    this.speed = this.preDisableSpeed;
  }

  disable() {
    this.preDisableSpeed = this.speed;
    this.speed = 0;
  }
}


export class Stomper extends Trait {
  constructor() {
    super('stomper');

    this.bounceSpeed = 400;
    this.shouldBounce = false;
  }

  bounce(us, them) {
    us.collisionBox.bottom = them.collisionBox.top;
    this.shouldBounce = true;
    us.playAudio('stomp');
  }

  update(entity, deltaTime, level) {
    if (this.shouldBounce) {
      entity.vel.y = -this.bounceSpeed;
      this.shouldBounce = false;
    }
  }
}


export class Killable extends Trait {
  constructor() {
    super('killable');

    this.dead = false;
    this.collisionDeath = false;
    this.timeDead = 0;
    this.timeAfterDeathToRemove = 2;
  }

  kill(timeAfterDeathToRemove = 2, collisionDeath = false) {
    this.dead = true;
    this.collisionDeath = collisionDeath;
    this.timeAfterDeathToRemove = timeAfterDeathToRemove;
  }

  update(entity, deltaTime, level) {
    if (this.dead) {
      this.timeDead += deltaTime;
      if (this.timeDead > this.timeAfterDeathToRemove)
        level.removeEntity(entity);
    }
    else if (entity.pos.y > 15 * 16)
      this.kill(0);
  }
}


export class Revivable extends Trait {
  constructor() {
    super('revivable');

    this.timeOutOfGame = 0;
    this.timeTilRevival = 1;
  }

  update(entity, deltaTime, level) {
    if (!level.revivableEntities.includes(entity))
      return;

    this.timeOutOfGame += deltaTime;
    
    if (this.timeOutOfGame > this.timeTilRevival) {
      this.timeOutOfGame = 0;
      level.reviveEntity(entity);
    }
  }
}


// CollidesWithTiles and CollidesWithEntities are a little awkward, the code feels a bit too much
// like spaghetti but in some sense it's nice as it keeps things consistent.  Thinking of removing
// these traits and just doing it with interface functions in the main update loop, the issue is
// that the loop may get too complicated, need to think about this...
export class CollidesWithTiles extends Trait {
  constructor() {
    super('collidesWithTiles');

    this.enabled = true;
  }

  update(entity, deltaTime, level) {          // really awkward that position gets updated here,...
    entity.pos.x += entity.vel.x * deltaTime; // ...not sure what to do about this
    this.checkX(entity, level.tiles.get('collision'));

    entity.pos.y += entity.vel.y * deltaTime;
    this.checkY(entity, level.tiles.get('collision'));
  }

  tileCollision(entity, side, tileCollidedWith, candidateColllisionTiles) {
    if (!this.enabled)
      return;
    
    if (side === 'below') {
      entity.vel.y = 0;
      entity.collisionBox.bottom = tileCollidedWith.top;
    }
    else if (side === 'right') {
      entity.vel.x = 0;
      entity.collisionBox.right = tileCollidedWith.left;
    }
    else if (side === 'above') {
      entity.vel.y = 0;
      entity.collisionBox.top = tileCollidedWith.bottom;
    }
    else if (side === 'left') {
      entity.vel.x = 0;
      entity.collisionBox.left = tileCollidedWith.right;
    }
  }

  checkX(entity, tiles) {
    if (entity.vel.x === 0)
      return;
  
    const sideEntityIsMoving = (entity.vel.x > 0) ?
      entity.collisionBox.right : entity.collisionBox.left;
    const candidateTiles = searchByRange(tiles,
      sideEntityIsMoving, sideEntityIsMoving,
      entity.collisionBox.top, entity.collisionBox.bottom);
  
    candidateTiles.forEach(candidateTile => {
      if (candidateTile.tile.type !== 'solid')
        return;
  
      if (entity.vel.x > 0) {
        if (entity.collisionBox.right > candidateTile.left) {
          entity.collideWithTile('right', candidateTile, candidateTiles);
        }
      }
      else if (entity.vel.x < 0) {
        if (entity.collisionBox.left < candidateTile.right) {
          entity.collideWithTile('left', candidateTile, candidateTiles);
        }
      }
    });
  }
  
  checkY(entity, tiles) {
    if (entity.vel.y === 0)
      return;
  
    const sideEntityIsMoving = (entity.vel.y > 0) ?
      entity.collisionBox.bottom : entity.collisionBox.top;
    const candidateTiles = searchByRange(tiles,
      entity.collisionBox.left, entity.collisionBox.right,
      sideEntityIsMoving, sideEntityIsMoving);
  
    candidateTiles.forEach(candidateTile => {
      if (candidateTile.tile.type !== 'solid')
        return;
  
      if (entity.vel.y > 0) {
        if (entity.collisionBox.bottom > candidateTile.top) {
          entity.collideWithTile('below', candidateTile, candidateTiles);
        }
      }
      else if (entity.vel.y < 0) {
        if (entity.collisionBox.top < candidateTile.bottom) {
          entity.collideWithTile('above', candidateTile, candidateTiles);
        }
      }
    });
  }
}


export class CollidesWithEntities extends Trait {
  constructor() {
    super('collidesWithEntities')

    this.enabled = true;
    this.temporarilyDisabled = false;
    this.timeDisabled = 0;
    this.disableDuration = Infinity;
  }

  update(entity, deltaTime, level) {
    if (this.enabled)
      this.check(entity, level.entities);
    else if (this.temporarilyDisabled) {
      this.timeDisabled += deltaTime;
      if (this.timeDisabled >= this.disableDuration) {
        this.enabled = true;
        this.temporarilyDisabled = false;
      }
    }
  }

  check(subject, entities) {
    entities.forEach(candidate => {
      if (subject === candidate)
        return;
      
      if (!candidate.collidesWithEntities.enabled)    // don't need to check subject as check won't get...
        return;                                       // ...called from trait if entity collision disabled

      if (subject.collisionBox.overlaps(candidate.collisionBox)) {
        subject.collideWithEntity(candidate);
        candidate.collideWithEntity(subject);
      }
    });
  }

  disableTemporarily(disableDuration) {
    this.enabled = false;
    this.temporarilyDisabled = true;
    this.timeDisabled = 0;
    this.disableDuration = disableDuration;
  }
}


// I think this may have to be added to entity traits after CollidesWithTiles
// need to check though...
export class HasMass extends Trait {
  constructor() {
    super('hasMass');
  }

  update(entity, deltaTime, level) {
    entity.vel.y += level.gravity * deltaTime;
  }
}


export class Collector extends Trait {
  constructor() {
    super('collector');

    this.coinsCollected = 0;
  }
}


export class StuckInLevel extends Trait {
  constructor() {
    super('stuckInLevel');
  }

  update(entity, deltaTime, level) {
    if (entity.collisionBox.left < 0) {
      entity.collisionBox.left = 0;
      entity.vel.x = 0;
    }
    else if (entity.collisionBox.right > 16 * level.length) {
      entity.collisionBox.right = 16 * level.length;
      entity.vel.x = 0;
    }
  }
}


export class BumpsBlocks extends Trait {
  constructor() {
    super('bumpsBlocks');

    this.hudAnimations = [];
    this.tileAnimations = [];
    this.entitiesToSpawnInfo = [];
  }

  update(entity, deltaTime, level) {
    this.tileAnimations.forEach(tileInfo => this.bumpTile(tileInfo));

    level.hudAnimations.push(...this.hudAnimations);
    this.hudAnimations.length = 0;

    level.entitiesToSpawnInfo.push(...this.entitiesToSpawnInfo);
    this.entitiesToSpawnInfo.length = 0;
  }

  bumpTile(tileInfo) {
    ++tileInfo.frame;

    if (tileInfo.frame >= 1 && tileInfo.frame <= 3)
      tileInfo.tile.yPos -= 2;
    else if (tileInfo.frame >= 4 && tileInfo.frame <= 5)
      tileInfo.tile.yPos += 2;
    else if (tileInfo.frame === 6) {  // On last frame of animation, decrement quantity of...
      tileInfo.tile.yPos += 2;        // ...item in block and spawn any entities necessary
      if (tileInfo.tile.contains) {
        --tileInfo.tile.quantity;
        if (tileInfo.tile.contains !== 'coin') {
          this.entitiesToSpawnInfo.push({
            name: tileInfo.tile.contains,
            xPos: tileInfo.tile.xPos,
            yPos: tileInfo.tile.yPos
          });
        }
      }

      if (tileInfo.tile.quantity <= 0) {
        tileInfo.tile.name = 'bumpedBlock';
        delete tileInfo.tile.contains;
        delete tileInfo.tile.quantity;
      }

      const tileInfoIndex = this.tileAnimations.indexOf(tileInfo);
      this.hudAnimations.splice(tileInfoIndex, 1);
    }
  }

  tileCollision(entity, side, tileCollidedWith, candidateCollisionTiles) {
    if (side !== 'above')
      return;
    
    const tilesAboveEntity =
      this.tilesAboveEntity(entity, tileCollidedWith, candidateCollisionTiles);

    tilesAboveEntity.forEach(tile => {
      if (!tile.tile.contains) {
        if (tile.tile.name === 'bumpedBlock' || tile.tile.name === 'brickTop')
          entity.playAudio('bump');
      }
      else {
        if (tile.tile.contains === 'coin') {    // power-ups are spawned after tile has been bumped
          if (entity.collector)
            entity.collector.coinsCollected++;

          if (entity.scoresPoints) {
            entity.scoresPoints.pointsScored += 200;
            this.hudAnimations.push({
              type: 'coin',
              xPos: tile.tile.xPos,
              yPos: tile.tile.yPos - TileSize,
              frame: 0
            }); 
          }

          entity.playAudio('collectCoin');
        }
      }

      if (tile.tile.name !== 'bumpedBlock') {
        this.tileAnimations.push({
          tile: tile.tile,
          frame: 0
        });
      }
    });
  }

  tilesAboveEntity(entity, tileCollidedWith, candidateCollisionTiles) {
    const tilesAbove = [];
    candidateCollisionTiles.forEach(tile => {
      if (tile.top === tileCollidedWith.top
        && this.horizontalOverlapPercentage(entity.collisionBox, tile) >= 25)
        tilesAbove.push(tile);
    });

    if (tilesAbove.length === 0)
      tilesAbove.push(tileCollidedWith);

    return tilesAbove;
  }

  horizontalOverlapPercentage(box, otherBox) {
    const innerLeftEdge = (box.left < otherBox.left) ? otherBox.left : box.left;
    const innerRightEdge = (box.right > otherBox.right) ? otherBox.right : box.right;

    return (innerRightEdge - innerLeftEdge) * 100 / 16;
  }
}


export class ScoresPoints extends Trait {
  constructor() {
    super('scoresPoints');

    this.pointsScored = 0;
    this.hudAnimations = [];
  }

  update(entity, deltaTime, level) {
    level.hudAnimations.push(...this.hudAnimations);
    this.hudAnimations.length = 0;
  }
}


export class SpawnsFromBlock extends Trait {
  constructor() {
    super('spawnsFromBlock');

    this.spawning = true;
    this.spawnFrame = 0;
    this.spawnDuration = 32;
  }

  update(entity, deltaTime, level) {
    if (!this.spawning)
      return;

    ++this.spawnFrame;
    entity.pos.y -= 0.5;
    if (this.spawnFrame >= this.spawnDuration)
      this.spawning = false;
  }
}


export class BouncyAI extends Trait {
  constructor() {
    super('bouncyAI');

    this.shouldBounce = false;
    this.shouldCancel = false;
  }

  update(entity, deltaTime, level) {
    if (this.shouldBounce)
      entity.vel.y = -350;
    else if (this.shouldCancel)
      entity.vel.y = 0;
    
    this.shouldBounce = false;
    this.shouldCancel = false;
  }

  tileCollision(entity, side, tileCollidedWith, candidateCollisiontiles) {
    if (side === 'below')
      this.shouldBounce = true;
    else if (side === 'above')
      this.shouldCancel = true;
  }
}


export class Collectable extends Trait {
  constructor(hudInfo, soundToPlayOnCollection, displayHUDAnimation = true) {
    super('collectable');

    this.collected = false;
    this.hudInfo = hudInfo;
    this.soundToPlayOnCollection = soundToPlayOnCollection;
    this.displayHUDAnimation = displayHUDAnimation;
  }

  update(entity, deltaTime, level) {
    if (this.collected)
      level.removeEntity(entity);
  }

  entityCollision(us, them) {
    if (this.collected)
      return;

    const typeOfHUDInfo = typeof(this.hudInfo);
    
    if (them.collector) {
      if (typeOfHUDInfo === 'number') {
        if (them.scoresPoints)
          them.scoresPoints.pointsScored += this.hudInfo;
  
        if (this.displayHUDAnimation) {
          them.scoresPoints.hudAnimations.push({
            type: 'risingText',
            points: this.hudInfo.toString(),
            xPos: us.collisionBox.left,
            yPos: us.collisionBox.top - us.height,
            frame: 0
          });
        }
      }
      else if (typeOfHUDInfo === 'string') {
        if (this.displayHUDAnimation) {
          them.scoresPoints.hudAnimations.push({
            type: 'risingText',
            points: this.hudInfo,
            xPos: us.collisionBox.left,
            yPos: us.collisionBox.top - us.height,
            frame: 0
          });
        }
      }

      this.collected = true;
      them.playAudio(this.soundToPlayOnCollection);
    }
  }
}

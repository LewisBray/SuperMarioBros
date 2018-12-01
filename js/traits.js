
// Traits are mini classes that each handle the logic for an
// individual trait an entity can have, the Entity class then
// loops all over all of these during the update of the entity

// Base class for traits to inherit from
export class Trait {
  constructor(name) {
    this.name = name;
  }

  tileCollision(entity, side, tileCollidedWith) {
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

  tileCollision(entity, side, tileCollidedWith) {
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


// Need better name for this trait, it's movement that bounces off walls regardless of wallking
export class AIWalk extends Trait {
  constructor(speed) {
    super('aiWalk');

    this.speed = speed;
    this.preDisableSpeed = speed;
  }

  tileCollision(entity, side, tileCollidedWith) {
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
  }

  update(entity, deltaTime, level) {
    if (this.shouldBounce) {
      entity.vel.y = -this.bounceSpeed;
      this.shouldBounce = false;
    }
  }
}


// Class needs to be extended to handle instant deaths (e.g.
// from sliding koopa shells), could modify timeAfterDeathToRemove ?
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
      this.kill();
  }
}


export class Revivable extends Trait {
  constructor() {
    super('revivable');

    this.timeOutOfGame = 0;
    this.timeTilRevival = 1;
  }

  update(entity, deltaTime, level) {
    if (level.revivableEntities.includes(entity))
      this.timeOutOfGame += deltaTime;
    
    if (this.timeOutOfGame > this.timeTilRevival) {
      this.timeOutOfGame = 0;
      level.reviveEntity(entity);
    }
  }
}


export class CollidesWithTiles extends Trait {
  constructor() {
    super('collidesWithTiles');

    this.enabled = true;
  }

  update(entity, deltaTime, level) {          // really awkward position gets updated here, not sure what to do...
    entity.pos.x += entity.vel.x * deltaTime;
    level.tileCollider.checkX(entity);

    entity.pos.y += entity.vel.y * deltaTime;
    level.tileCollider.checkY(entity);
  }

  tileCollision(entity, side, tileCollidedWith) {
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
    else if (side === 'left') {
      entity.vel.x = 0;
      entity.collisionBox.left = tileCollidedWith.right;
    }
    else if (side === 'above') {
      entity.vel.y = 0;
      entity.collisionBox.top = tileCollidedWith.bottom;
    }
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
      level.entityCollider.check(entity);
    else if (this.temporarilyDisabled) {
      this.timeDisabled += deltaTime;
      if (this.timeDisabled >= this.disableDuration) {
        this.enabled = true;
        this.temporarilyDisabled = false;
      }
    }
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
    super('behaviour');
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

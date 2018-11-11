
// Traits are mini classes that each handle the logic for an
// individual trait an entity can have, the Entity class then
// loops all over all of these during the update of the entity

// Base class for traits to inherit from
export class Trait {
  constructor(name) {
    this.name = name;
  }

  collide(entity, side) {
    // Empty so traits don't have to be implemented if not necessary
  }

  entityCollision(us, them) {

  }

  // Make sure we override the update method in the derived class
  update(entity, deltaTime, level) {
    // Empty so traits don't have to be implemented if not necessary
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

  collide(entity, side) {
    if (side === 'below') {
      this.ready = true;
      this.isJumping = false;
    }
    else if (side === 'above')
      this.cancel();
  }

  update(entity, deltaTime) {
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

  update(entity, deltaTime) {
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


export class AIWalk extends Trait {
  constructor(speed) {
    super('aiWalk');

    this.speed = speed;
    this.preDisableSpeed = speed;
  }

  collide(entity, side) {
    if (side === 'left' || side === 'right')
      this.speed *= -1;
  }

  update(entity, deltaTime) {
      entity.vel.x = this.speed;
  }

  enable() {
    this.speed = this.preDisableSpeed;
  }

  disable() {
    this.preDisableSpeed = this.speed;
    this.speed = 0;
  }

  isEnabled() {
    return (this.speed !== 0);
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

  update(entity, deltaTime) {
    if (this.shouldBounce) {
      entity.vel.y = -this.bounceSpeed;
      this.shouldBounce = false;
    }
  }
}


// Class needs to be extended to handle instant deaths (e.g.
// from sliding koopa shells), could modify timeAfterDeathToremove ?
export class Killable extends Trait {
  constructor() {
    super('killable');

    this.dead = false;
    this.timeDead = 0;
    this.timeAfterDeathToRemove = 2;
  }

  kill() {
    this.dead = true;
  }

  update(entity, deltaTime, level) {
    if (this.dead) {
      this.timeDead += deltaTime;
      if (this.timeDead > this.timeAfterDeathToRemove)
        level.removeEntity(entity);
    }
  }
}


export class Revivable extends Trait {
  constructor() {
    super('revivable');

    this.timeDead = 0;
    this.timeToRevival = 1;
  }
}

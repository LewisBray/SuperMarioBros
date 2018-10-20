
// Traits are mini classes that each handle the logic for an
// individual trait an entity can have, the Entity class then
// loops all over all of these during the update of the entity

// Base class for traits to inherit from
class Trait {
  constructor(name) {
    this.name = name;
  }

  collide(entity, side) {
    // Empty so traits don't have to be implemented if not necessary
  }

  // Make sure we override the update method in the derived class
  update(deltaTime) {
    console.warn('Unhandled trait update call.');
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
  }

  collide(entity, side) {
    if (side === 'left' || side === 'right')
      this.speed *= -1;
  }

  update(entity, deltaTime) {
    entity.vel.x = this.speed;
  }
}

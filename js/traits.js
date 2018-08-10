
// Traits are mini classes that each handle the logic for an
// individual trait an entity can have, the Entity class then
// loops all over all of these during the update of the entity

// Base class for traits to inherit from
class Trait {
  constructor(name) {
    this.name = name;
  }

  // Make sure we override the update method in the derived class
  update(deltaTime) {
    console.warn('Unhandled trait update call.');
  }
}


export class Jump extends Trait {
  constructor() {
    super('jump');

    this.duration = 0.5;
    this.velocity = 200;
    this.engageTime = 0;
  }

  start() {
    this.engageTime = this.duration;
  }

  cancel() {
    this.engageTime = 0;
  }

  update(entity, deltaTime) {
    if (this.engageTime > 0) {
      entity.vel.y = -this.velocity;
      this.engageTime -= deltaTime;
    }
  }
}


export class Move extends Trait {
  constructor() {
    super('move');

    this.direction = 0;
    this.speed = 6000;
    this.distance = 0;
    this.heading = 1;
  }

  update(entity, deltaTime) {
    entity.vel.x = this.speed * this.direction * deltaTime;

    if (this.direction !== 0) {
      this.heading = this.direction;
      this.distance += Math.abs(entity.vel.x) * deltaTime;
    }
    else
      this.distance = 0;
  }
}

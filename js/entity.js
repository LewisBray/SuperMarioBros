import CollisionBox from './collisionbox.js';

// Base class for all characters/enemies/etc...
export default class Entity {
  constructor(pos, vel, width, height) {
    this.pos = pos;
    this.vel = vel;
    this.width = width;
    this.height = height;
    this.lifetime = 0;
    this.traits = [];
    this.collisionBox = new CollisionBox(this.pos, this.width, this.height);
  }

  addTrait(trait) {
    this.traits.push(trait);
    this[trait.name] = trait;
  }

  collide(side) {
    this.traits.forEach(trait => {
      trait.collide(this, side);
    })
  }

  collideWithEntity(otherEntity) {
    this.traits.forEach(trait => {
      trait.entityCollision(this, otherEntity);
    })
  }

  update(deltaTime, level) {
    this.traits.forEach(trait => {
      trait.update(this, deltaTime, level);
    });

    this.lifetime += deltaTime;
  }
}

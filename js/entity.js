import CollisionBox from './collisionbox.js';
import {Vec} from './maths.js';

// Base class for all characters/enemies/etc...
export default class Entity {
  constructor(width, height) {
    this.pos = new Vec();
    this.vel = new Vec();
    this.width = width;
    this.height = height;
    this.lifetime = 0;
    this.traits = [];
    this.collisionBox = new CollisionBox(this.pos, this.width, this.height);
    this.entityCollisionEnabled = true;
  }

  addTrait(trait) {
    this.traits.push(trait);
    this[trait.name] = trait;
  }

  collideWithTile(side, tile) {
    this.traits.forEach(trait => {
      trait.tileCollision(this, side, tile);
    })
  }

  collideWithEntity(entity) {
    this.traits.forEach(trait => {
      trait.entityCollision(this, entity);
    })
  }

  update(deltaTime, level) {
    this.traits.forEach(trait => {
      trait.update(this, deltaTime, level);
    });

    this.lifetime += deltaTime;
  }
}

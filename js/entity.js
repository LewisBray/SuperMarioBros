
// Base class for all characters/enemies/etc...
export default class Entity {
  constructor(pos, vel, width, height) {
    this.pos = pos;
    this.vel = vel;
    this.width = width;
    this.height = height;
    this.traits = [];
  }

  addTrait(trait) {
    this.traits.push(trait);
    this[trait.name] = trait;
  }

  update(deltaTime) {
    this.traits.forEach(trait => {
      trait.update(this, deltaTime);
    });
  }
}

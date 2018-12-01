import TileCollider from './tilecollider.js';
import EntityCollider from './entitycollider.js';
import Compositor from './compositor.js';


// Handles all aspects of a level (background, entities, etc...)
export default class Level {
  constructor() {
    this.gravity = 1500;
    this.totalTime = 0;
    this.name = '';
    this.length = 0;

    this.compositor = new Compositor();
    this.entities = [];
    this.revivableEntities = [];
    this.tileCollider = null;
    this.entityCollider = new EntityCollider(this.entities);
  }

  setCollisionGrid(matrix) {
    this.tileCollider = new TileCollider(matrix);
  }

  update(deltaTime) {
    this.entities.forEach(entity => {
      entity.update(deltaTime, this);
    });

    this.revivableEntities.forEach(entity => {
      entity.revivable.update(entity, deltaTime, this);
    });

    this.totalTime += deltaTime;
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

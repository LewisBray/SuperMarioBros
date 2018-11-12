import TileCollider from './tilecollider.js';
import EntityCollider from './entitycollider.js';
import Compositor from './compositor.js';


// Handles all aspects of a level (background, entities, etc...)
export default class Level {
  constructor(backgroundColour) {
    this.gravity = 1500;
    this.totalTime = 0;
    this.backgroundColour = backgroundColour;

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

      entity.pos.x += entity.vel.x * deltaTime;
      this.tileCollider.checkX(entity);

      entity.pos.y += entity.vel.y * deltaTime;
      this.tileCollider.checkY(entity);

      entity.vel.y += this.gravity * deltaTime;
    });

    this.entities.forEach(entity => {
      this.entityCollider.check(entity);
    });

    this.revivableEntities.forEach(entity => {
      entity.revivable.timeDead += deltaTime;       // this logic needs to be moved into trait class
      if (entity.revivable.timeDead > entity.revivable.timeToRevival)
        this.reviveEntity(entity);
    })

    this.totalTime += deltaTime;
  }

  removeEntity(entity) {
    if (entity.revivable)
      this.revivableEntities.push(entity);

    const entityIndex = this.entities.indexOf(entity);
    this.entities.splice(entityIndex, 1);
  }

  reviveEntity(entity) {
    entity.revivable.timeDead = 0;
    entity.killable.dead = false;
    entity.killable.timeDead = 0;
    entity.pos.y = 32;

    this.entities.push(entity);

    const entityIndex = this.revivableEntities.indexOf(entity);
    this.revivableEntities.splice(entityIndex, 1);
  }
}

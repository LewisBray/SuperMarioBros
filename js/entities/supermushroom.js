import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {Trait, HasMass, CollidesWithTiles,
  CollidesWithEntities, SimpleAI, SpawnsFromBlock} from '../traits.js';


export function loadSuperMushroom() {
  return loadJSON('/js/specifications/entities/supermushroom.json')
  .then(entitySpec => Promise.all([
    loadSpriteSet(entitySpec),
    entitySpec
  ]))
  .then(([animSpriteSet, entitySpec]) => {
    return createSuperMushroomFactory(animSpriteSet, entitySpec);
  });
}


class Behaviour extends Trait {
  constructor() {
    super('behaviour');

    this.traitsAddedAfterSpawn = false;
  }

  entityCollision(us, them) {
    if (this.collected)
      return;
    
    if (them.collector) {
      if (them.scoresPoints) {
        them.scoresPoints.pointsScored += 1000;
        them.scoresPoints.hudAnimations.push({
          type: 'score',
          points: '1000',
          xPos: us.collisionBox.left,
          yPos: us.collisionBox.top - us.height,
          frame: 0
        });
      }
      this.collected = true;
      them.playAudio('collectSuperMushroom');
    }
  }

  update(entity, deltaTime, level) {
    if (!this.traitsAddedAfterSpawn) {
      if (entity.spawnsFromBlock && !entity.spawnsFromBlock.spawning) {
        entity.addTrait(new HasMass());
        entity.addTrait(new CollidesWithTiles());
        this.traitsAddedAfterSpawn = true;
      }
    }

    if (this.collected || entity.yPos > 15 * 16)
      level.removeEntity(entity);
  }
}


function createSuperMushroomFactory(animSpriteSet, entitySpec) {
  function drawSuperMushroom(context, camera) {
    animSpriteSet.draw('mushroom', context, this.pos.x - camera.xPos, this.pos.y);
  }


  return () => {
    const superMushroom = new Entity(16, 16);

    entitySpec.audio.forEach(audio => {
      superMushroom.audio.set(audio.name, new Audio(`/js/music/effects/${audio.file}.wav`));
    });

    // mass and tile collision traits after done spawning from block
    superMushroom.addTrait(new SimpleAI(50));
    superMushroom.addTrait(new Behaviour());
    superMushroom.addTrait(new SpawnsFromBlock());
    superMushroom.addTrait(new CollidesWithEntities());

    superMushroom.draw = drawSuperMushroom;

    return superMushroom;
  }
}

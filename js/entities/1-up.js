import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {Trait, HasMass, CollidesWithTiles,
  CollidesWithEntities, SimpleAI, SpawnsFromBlock, Collectable} from '../traits.js';


export function load1Up() {
  return loadJSON('/js/specifications/entities/1-up.json')
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

  update(entity, deltaTime, level) {
    if (!this.traitsAddedAfterSpawn) {
      if (entity.spawnsFromBlock && !entity.spawnsFromBlock.spawning) {
        entity.addTrait(new HasMass());
        entity.addTrait(new CollidesWithTiles());
        this.traitsAddedAfterSpawn = true;
      }
    }

    if (entity.yPos > 15 * 16)
      level.removeEntity(entity);
  }
}


function createSuperMushroomFactory(animSpriteSet, entitySpec) {
  function draw1Up(context, camera) {
    animSpriteSet.draw('1-up', context, this.pos.x - camera.xPos, this.pos.y);
  }


  return () => {
    const oneUp = new Entity(16, 16);

    entitySpec.audio.forEach(audio => {
      oneUp.audio.set(audio.name, new Audio(`/js/music/effects/${audio.file}.wav`));
    });

    // mass and tile collision traits after done spawning from block
    oneUp.addTrait(new Behaviour());
    oneUp.addTrait(new SimpleAI(50));
    oneUp.addTrait(new SpawnsFromBlock());
    oneUp.addTrait(new CollidesWithEntities());
    oneUp.addTrait(new Collectable('1-up', 'collect1Up'));

    oneUp.draw = draw1Up;

    return oneUp;
  }
}

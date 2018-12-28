import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {Trait, HasMass, CollidesWithTiles,
  CollidesWithEntities, SimpleAI, SpawnsFromBlock, BouncyAI, Collectable} from '../traits.js';


export function loadPowerStar() {
  return loadJSON('/js/specifications/entities/powerstar.json')
  .then(entitySpec => Promise.all([
    loadSpriteSet(entitySpec),
    entitySpec
  ]))
  .then(([animSpriteSet, entitySpec]) => {
    return createPowerStarFactory(animSpriteSet, entitySpec);
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
        entity.addTrait(new SimpleAI(60));
        entity.addTrait(new BouncyAI());
        this.traitsAddedAfterSpawn = true;
      }
    }

    if (entity.yPos > 15 * 16)
      level.removeEntity(entity);
  }
}


function createPowerStarFactory(animSpriteSet, entitySpec) {
  const animFrameSelector = animSpriteSet.animations.get('powerStar');

  function drawPowerStar(context, camera) {
    animSpriteSet.draw(animFrameSelector(this.lifetime),
      context, this.pos.x - camera.xPos, this.pos.y);
  }

  return () => {
    const powerStar = new Entity(16, 16);

    entitySpec.audio.forEach(audio => {
      powerStar.audio.set(audio.name, new Audio(`/js/music/effects/${audio.file}.wav`));
    });

    // mass and tile collision traits after done spawning from block
    // powerStar.addTrait(new SimpleAI(50));
    // powerStar.addTrait(new BouncyAI());
    powerStar.addTrait(new Behaviour());
    powerStar.addTrait(new SpawnsFromBlock());
    powerStar.addTrait(new CollidesWithEntities());
    powerStar.addTrait(new Collectable(1000, 'collectItem'));

    powerStar.draw = drawPowerStar;

    return powerStar;
  }
}

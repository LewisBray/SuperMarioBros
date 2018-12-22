import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {Trait, HasMass, CollidesWithTiles,
  CollidesWithEntities, SimpleAI, SpawnsFromBlock, BouncyAI} from '../traits.js';


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
    powerStar.addTrait(new SimpleAI(50));
    powerStar.addTrait(new BouncyAI());
    powerStar.addTrait(new Behaviour());
    powerStar.addTrait(new SpawnsFromBlock());
    powerStar.addTrait(new CollidesWithEntities());

    powerStar.draw = drawPowerStar;

    return powerStar;
  }
}

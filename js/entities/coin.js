import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {Trait, CollidesWithEntities} from '../traits.js';


export function loadCoin() {
  return loadJSON('/js/specifications/entities/coin.json')
  .then(entitySpec => Promise.all([
    loadSpriteSet(entitySpec),
    entitySpec
  ]))
  .then(([animSpriteSet, entitySpec]) => {
    return createCoinFactory(animSpriteSet, entitySpec);
  });
}


class Behaviour extends Trait {
  constructor() {
    super('behaviour');

    this.collected = false;
  }

  entityCollision(us, them) {
    if (this.collected)
      return;
    
    if (them.collector) {
      them.collector.coinsCollected++;
      if (them.scoresPoints)
        them.scoresPoints.pointsScored += 200;
      this.collected = true;
      them.playAudio('collectCoin');
    }
  }

  update(entity, deltaTime, level) {
    if (this.collected)
      level.removeEntity(entity);
  }
}


function createCoinFactory(animSpriteSet, entitySpec) {
  const animFrameSelector = animSpriteSet.animations.get('coin');

  function drawCoin(context, camera) {
    animSpriteSet.draw(animFrameSelector(this.lifetime), context,
      this.pos.x - camera.xPos, this.pos.y);
  }

  return () => {
    const coin = new Entity(16, 16);

    coin.addTrait(new Behaviour());
    coin.addTrait(new CollidesWithEntities());

    coin.draw = drawCoin;

    return coin;
  }
}

import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {CollidesWithEntities, Collectable} from '../traits.js';


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


function createCoinFactory(animSpriteSet, entitySpec) {
  const animFrameSelector = animSpriteSet.animations.get('coin');

  function drawCoin(context, camera) {
    animSpriteSet.draw(animFrameSelector(this.lifetime), context,
      this.pos.x - camera.xPos, this.pos.y);
  }

  return () => {
    const coin = new Entity(16, 16);

    coin.addTrait(new CollidesWithEntities());
    coin.addTrait(new Collectable(200, 'collectCoin', false));

    coin.draw = drawCoin;

    return coin;
  }
}

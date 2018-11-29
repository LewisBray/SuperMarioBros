import Entity from './entity.js';
import {loadSpriteSet} from './loaders.js';
import {Trait} from './traits.js';


export function loadCoin() {
  return loadSpriteSet('/js/animations/coin.json')
  .then(createCoinFactory);
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
      this.collected = true;
    }
  }

  update(entity, deltaTime, level) {
    if (this.collected)
      level.removeEntity(entity);
  }
}


function createCoinFactory(animSpriteSet) {
  const animFrameSelector = animSpriteSet.animations.get('coin');

  function drawCoin(context, camera) {
    animSpriteSet.draw(animFrameSelector(this.lifetime), context,
      this.pos.x - camera.pos.x, this.pos.y - camera.pos.y);
  }

  return () => {
    const coin = new Entity(16, 16);

    coin.addTrait(new Behaviour());

    coin.draw = drawCoin;

    return coin;
  }
}

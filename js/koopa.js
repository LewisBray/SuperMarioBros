import Entity from './entity.js';
import {Vec} from './maths.js';
import {AIWalk} from './traits.js';
import {loadSpriteSet} from './loaders.js';


export function loadKoopa() {
  return loadSpriteSet('/js/animations/koopa.json', 16, 24)
  .then(createKoopaFactory);
}


function createKoopaFactory(animSpriteSet) {
  const walkAnimFrameSelector = animSpriteSet.animations.get('walk');

  function drawKoopa(context, camera) {
    animSpriteSet.draw(walkAnimFrameSelector(this.lifetime), context,
      this.pos.x - camera.pos.x, this.pos.y - camera.pos.y, this.vel.x < 0);
  }

  return () => {
    const koopa = new Entity(new Vec(128, 192), new Vec(0, 0), 16, 24);
    koopa.collisionBox.yOffset = 8;

    koopa.addTrait(new AIWalk(-30));

    koopa.draw = drawKoopa;

    console.log(koopa);

    return koopa;
  }
}

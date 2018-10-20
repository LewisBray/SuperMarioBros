import Entity from './entity.js';
import {Vec} from './maths.js';
import {AIWalk} from './traits.js';
import {loadSpriteSet} from './loaders.js';


export function loadGoomba() {
  return loadSpriteSet('/js/animations/goomba.json')
  .then(createGoombaFactory);
}


function createGoombaFactory(animSpriteSet) {
  const walkAnimFrameSelector = animSpriteSet.animations.get('walk');

  function drawGoomba(context, camera) {
    animSpriteSet.draw(walkAnimFrameSelector(this.lifetime), context,
      this.pos.x - camera.pos.x, this.pos.y - camera.pos.y);
  }

  return () => {
    const goomba = new Entity(new Vec(128, 160), new Vec(0, 0), 16, 16);

    goomba.addTrait(new AIWalk(-30));

    goomba.draw = drawGoomba;

    return goomba;
  }
}

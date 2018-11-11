import Entity from './entity.js';
import {Vec} from './maths.js';
import {Trait, AIWalk, Killable} from './traits.js';
import {loadSpriteSet} from './loaders.js';


export function loadGoomba() {
  return loadSpriteSet('/js/animations/goomba.json')
  .then(createGoombaFactory);
}


class Behaviour extends Trait {
  constructor() {
    super('behaviour');
  }

  entityCollision(us, them) {
    if (us.killable && us.killable.dead)
      return;

    if (them.stomper) {
      if (them.vel.y > us.vel.y) {
        us.aiWalk.disable();
        us.killable.kill();
        them.stomper.bounce(them, us);
      }
      else if (them.killable)
        them.killable.kill();
    }
  }
}


function createGoombaFactory(animSpriteSet) {
  const walkAnimFrameSelector = animSpriteSet.animations.get('walk');

  function selectAnimFrame(goomba) {
    if (goomba.killable.dead)
      return 'squashed';        // Shouldn't be returned if slammed into by koopa shell

    return walkAnimFrameSelector(goomba.lifetime);
  }

  function drawGoomba(context, camera) {
    animSpriteSet.draw(selectAnimFrame(this), context,
      this.pos.x - camera.pos.x, this.pos.y - camera.pos.y);
  }

  return () => {
    const goomba = new Entity(new Vec(128, 160), new Vec(0, 0), 16, 16);

    goomba.addTrait(new AIWalk(-30));
    goomba.addTrait(new Behaviour());
    goomba.addTrait(new Killable());

    goomba.draw = drawGoomba;

    return goomba;
  }
}

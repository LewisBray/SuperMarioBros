import Entity from './entity.js';
import {loadSpriteSet} from './loaders.js';
import {Trait, CollidesWithTiles, HasMass, AIWalk, Killable} from './traits.js';


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
    
    if (!them.stomper)
      return;

    if (them.vel.y > us.vel.y) {
      us.aiWalk.disable();
      us.killable.kill(2);
      them.stomper.bounce(them, us);
    }
    else if (them.killable)
      them.killable.kill(0);
  }
}


function createGoombaFactory(animSpriteSet) {
  const walkAnimFrameSelector = animSpriteSet.animations.get('walk');

  function selectAnimFrame(goomba) {
    if (goomba.killable && goomba.killable.dead) {
      if (goomba.killable.collisionDeath)
        return 'walk-1';        // should this be upside down?
      else
        return 'squashed';
    }

    return walkAnimFrameSelector(goomba.lifetime);
  }

  function drawGoomba(context, camera) {
    animSpriteSet.draw(selectAnimFrame(this), context,
      this.pos.x - camera.pos.x, this.pos.y - camera.pos.y);
  }

  return () => {
    const goomba = new Entity(16, 16);

    goomba.addTrait(new AIWalk(-30));
    goomba.addTrait(new Behaviour());
    goomba.addTrait(new Killable());
    goomba.addTrait(new CollidesWithTiles());
    goomba.addTrait(new HasMass());
    
    goomba.draw = drawGoomba;

    return goomba;
  }
}

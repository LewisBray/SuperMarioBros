import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {Trait, CollidesWithTiles, CollidesWithEntities, HasMass, SimpleAI, Killable} from '../traits.js';


export function loadGoomba() {
  return loadJSON('/js/specifications/entities/goomba.json')
  .then(entitySpec => Promise.all([
    loadSpriteSet(entitySpec),
    entitySpec
  ]))
  .then(([animSpriteSet, entitySpec]) => {
    return createGoombaFactory(animSpriteSet, entitySpec)
  });
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
      if (them.scoresPoints) {
        them.scoresPoints.pointsScored += 100;
        them.scoresPoints.hudAnimations.push({
          type: 'risingText',
          points: '100',
          xPos: us.collisionBox.left + 2,
          yPos: us.collisionBox.top - us.height,
          frame: 0
        });
      }
    }
    else if (them.killable)
      them.killable.kill(0);
  }
}


function createGoombaFactory(animSpriteSet, entitySpec) {
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
      this.pos.x - camera.xPos, this.pos.y);
  }

  return () => {
    const goomba = new Entity(16, 16);

    goomba.addTrait(new SimpleAI(-30));
    goomba.addTrait(new Behaviour());
    goomba.addTrait(new Killable());
    goomba.addTrait(new CollidesWithTiles());
    goomba.addTrait(new HasMass());
    goomba.addTrait(new CollidesWithEntities());
    
    goomba.draw = drawGoomba;

    return goomba;
  }
}

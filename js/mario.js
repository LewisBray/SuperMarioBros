import Entity from './entity.js';
import {Vec} from './maths.js';
import {Jump, Move} from './traits.js';
import {loadAnimationFrames} from './loaders.js';
import {animFrameSelectorFactory} from './animation.js';


const slowDrag = 1/2000;
const fastDrag = 1/5000;

// Another function that returns a promise, creating the Mario sprites requires
// loading a character sprite file which is asyncronous.  Once we have these we
// can set Mario's initial state and any traits he may have.
export function createMario() {
  return loadAnimationFrames('mario')
  .then(animSpriteSet => {
    const mario = new Entity(new Vec(64, 140), new Vec(0, 0), 16, 16);

    mario.addTrait(new Move());
    mario.move.dragFactor = slowDrag;

    mario.turbo = function(turboOn) {
      this.move.dragFactor = turboOn ? fastDrag : slowDrag;
    }

    mario.addTrait(new Jump());

    const runAnimFrameSelector = animFrameSelectorFactory(['run-1', 'run-2', 'run-3'], 10);
    function selectAnimFrame(mario) {
      if (mario.jump.isJumping)
        return 'jump';

      if ((mario.vel.x > 0 && mario.move.direction < 0)
        || (mario.vel.x < 0 && mario.move.direction > 0))
        return 'skid';

      if (mario.move.distance > 0)
        return runAnimFrameSelector(mario.move.distance);

      return 'idle';
    }

    mario.draw = function(context, camera) {
      animSpriteSet.draw(selectAnimFrame(this), context,
        this.pos.x - camera.pos.x,
        this.pos.y - camera.pos.y,
        this.move.heading < 0);
    }

    return mario;
  });
}

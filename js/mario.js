import Entity from './entity.js';
import {Vec} from './maths.js';
import {Jump, Move} from './traits.js';
import {loadSpriteSet} from './loaders.js';


const highDrag = 1/2000;
const lowDrag = 1/5000;

// Another function that returns a promise, creating the Mario sprites requires
// loading a character sprite file which is asyncronous.  Once we have these we
// can set Mario's initial state and any traits he may have.
export function loadMario() {
  return loadSpriteSet('/js/animations/mario.json')
  .then(createMarioFactory);
}


function createMarioFactory(animSpriteSet) {
  const runAnimFrameSelector = animSpriteSet.animations.get('run');

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

  function setTurboState(turboOn) {
    this.move.dragFactor = turboOn ? lowDrag : highDrag;
  }

  function drawMario(context, camera) {
    animSpriteSet.draw(selectAnimFrame(this), context,
      this.pos.x - camera.pos.x,
      this.pos.y - camera.pos.y,
      this.move.heading < 0);
  }

  return () => {
    const mario = new Entity(new Vec(64, 140), new Vec(0, 0), 16, 16);

    mario.addTrait(new Move());
    mario.addTrait(new Jump());

    mario.turbo = setTurboState;
    mario.draw = drawMario;

    mario.turbo(false);

    return mario;
  }
}

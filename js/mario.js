import Entity from './entity.js';
import {Jump, Move, CollidesWithTiles, CollidesWithEntities, HasMass,
  Stomper, Killable, Revivable, Collector, StuckInLevel, BumpsBlocks} from './traits.js';
import {loadJSON, loadSpriteSet} from './loaders.js';


const highDrag = 1/2000;
const lowDrag = 1/5000;

// Another function that returns a promise, creating the Mario sprites requires
// loading a character sprite file which is asyncronous.  Once we have these we
// can set Mario's initial state and any traits he may have.
export function loadMario() {
  return loadJSON('/js/animations/mario.json')
  .then(entitySpec => Promise.all([
    loadSpriteSet(entitySpec),
    entitySpec
  ]))
  .then(([animSpriteSet, entitySpec]) => {
    return createMarioFactory(animSpriteSet, entitySpec);
  });
}


function createMarioFactory(animSpriteSet, entitySpec) {
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
      this.pos.x - camera.xPos, this.pos.y, this.move.heading < 0);
  }

  return () => {
    const mario = new Entity(16, 16);

    entitySpec.audio.forEach(audio => {
      mario.audio.set(audio.name, new Audio(`/js/music/effects/${audio.file}.wav`));
    });

    mario.addTrait(new Move());
    mario.addTrait(new Jump());
    mario.addTrait(new Stomper());
    mario.addTrait(new Killable());
    mario.addTrait(new Revivable());
    mario.addTrait(new Collector());
    mario.addTrait(new StuckInLevel());
    mario.addTrait(new CollidesWithTiles());
    mario.addTrait(new HasMass());
    mario.addTrait(new BumpsBlocks());
    mario.addTrait(new CollidesWithEntities());

    mario.turbo = setTurboState;
    mario.draw = drawMario;

    mario.turbo(false);

    return mario;
  }
}

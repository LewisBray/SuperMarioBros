import Entity from './entity.js';
import {Vec} from './maths.js';
import {Jump, Velocity} from './traits.js';
import {createMarioSprites} from './sprites.js';


// Another function that returns a promise, creating the Mario sprites requires
// loading a character sprite file which is asyncronous.  Once we have these we
// can set Mario's initial state and any traits he may have.
export function createMario() {
  return createMarioSprites()
  .then(sprites => {
    const mario = new Entity(new Vec(64, 140), new Vec(0, 0));

    mario.addTrait(new Jump());
    mario.addTrait(new Velocity());

    mario.draw = function(context) {
      sprites.draw('idle', context, this.pos.x, this.pos.y);
    }

    return mario;
  });
}

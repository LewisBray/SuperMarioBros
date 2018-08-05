import {Vec} from './maths.js';

// Due to the 2D nature of the game, this
// doesn't really need any y values
export default class Camera {
  constructor(pos, size) {
    this.pos = pos;
    this.size = size;
  }
}

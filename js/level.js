import Compositor from './compositor.js';
import {Matrix} from './maths.js';


// Handles all aspects of a level (background, entities, etc...)
export default class Level {
  constructor() {
    this.compositor = new Compositor();
    this.entities = [];
    this.tiles = new Matrix();
  }

  update(deltaTime) {
    this.entities.forEach(entity => {
      entity.update(deltaTime);
    });
  }
}

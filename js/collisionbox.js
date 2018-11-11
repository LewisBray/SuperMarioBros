import {Vec} from './maths.js';

export default class CollisionBox {
  constructor(entityPos, entityWidth, entityHeight, xOffset = 0, yOffset = 0) {
    this.entityPos = entityPos;
    this.entityWidth = entityWidth;
    this.entityHeight = entityHeight;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
  }

  get top() {
    return this.entityPos.y + this.yOffset;
  }

  set top(y) {
    this.entityPos.y = y - this.yOffset;
  }

  get bottom() {
    return this.entityPos.y + this.entityHeight;
  }

  set bottom(y) {
    this.entityPos.y = y - this.entityHeight;
  }

  get left() {
    return this.entityPos.x + this.xOffset;
  }

  set left(x) {
    this.entityPos.x = x - this.xOffset;
  }

  get right() {
    return this.entityPos.x + this.entityWidth;
  }

  set right(x) {
    this.entityPos.x = x - this.entityWidth;
  }

  overlaps(otherBox) {
    return this.bottom > otherBox.top
      && this.top < otherBox.bottom
      && this.left < otherBox.right
      && this.right > otherBox.left;
  }
}

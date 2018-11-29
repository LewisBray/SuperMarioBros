// Due to the 2D nature of the game, this
// doesn't really need any y values
export default class Camera {
  constructor(pos, size) {
    this.pos = pos;
    this.size = size;
  }

  followEntity(entity, levelLength) {
    if (entity.pos.x < this.size.x / 2)
      this.pos.x = 0;
    else if (entity.pos.x > 16 * levelLength - this.size.x / 2)
      this.pos.x = 16 * levelLength - this.size.x;
    else
      this.pos.x = entity.pos.x - this.size.x / 2;
  }
}

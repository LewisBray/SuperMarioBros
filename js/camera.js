
// Due to the 2D nature of the game, this
// doesn't really need any y values
export default class Camera {
  constructor(width, height) {
    this.xPos = 0;
    this.width = width;
    this.height = height;
  }

  followEntity(entity, levelLength) {
    if (entity.pos.x < this.width / 2)
      this.xPos = 0;
    else if (entity.pos.x > 16 * levelLength - this.width / 2)
      this.xPos = 16 * levelLength - this.width;
    else
      this.xPos = entity.pos.x - this.width / 2;
  }
}

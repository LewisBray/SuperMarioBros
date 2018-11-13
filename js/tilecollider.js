
export default class TileCollider {
  constructor(tileMatrix) {
    this.tiles = new TileResolver(tileMatrix);
  }

  checkX(entity) {
    if (entity.vel.x === 0)
      return;

    const sideEntityIsMoving = (entity.vel.x > 0) ?
      entity.collisionBox.right : entity.collisionBox.left;
    const matchedTiles = this.tiles.searchByRange(
      sideEntityIsMoving, sideEntityIsMoving,
      entity.collisionBox.top, entity.collisionBox.bottom);

    matchedTiles.forEach(matchedTile => {
      if (matchedTile.tile.type !== 'solid')
        return;

      if (entity.vel.x > 0) {
        if (entity.collisionBox.right > matchedTile.left) {
          entity.collideWithTile('right', matchedTile);
        }
      }
      else if (entity.vel.x < 0) {
        if (entity.collisionBox.left < matchedTile.right) {
          entity.collideWithTile('left', matchedTile);
        }
      }
    });
  }

  checkY(entity) {
    if (entity.vel.y === 0)
      return;

    const sideEntityIsMoving = (entity.vel.y > 0) ?
      entity.collisionBox.bottom : entity.collisionBox.top;
    const matchedTiles = this.tiles.searchByRange(
      entity.collisionBox.left, entity.collisionBox.right,
      sideEntityIsMoving, sideEntityIsMoving);

    matchedTiles.forEach(matchedTile => {
      if (matchedTile.tile.type !== 'solid')
        return;

      if (entity.vel.y > 0) {
        if (entity.collisionBox.bottom > matchedTile.top) {
          entity.collideWithTile('below', matchedTile);
        }
      }
      else if (entity.vel.y < 0) {
        if (entity.collisionBox.top < matchedTile.bottom) {
          entity.collideWithTile('above', matchedTile);
        }
      }
    });
  }
}


export class TileResolver {
  constructor(matrix, tileSize = 16) {
    this.matrix = matrix;
    this.tileSize = tileSize;
  }

  toIndex(pos) {
    return Math.floor(pos / this.tileSize);
  }

  toIndexRange(pos1, pos2) {
    const indexRange = [];

    let index = this.toIndex(pos1);
    const maxIndex = ((pos2 % this.tileSize) === 0) ?
      this.toIndex(pos2) : this.toIndex(pos2) + 1;

    while (index < maxIndex) {
      indexRange.push(index);
      index += 1;
    }

    return indexRange;
  }

  getByIndex(indexX, indexY) {
    const tile = this.matrix.get(indexX, indexY);
    if (tile) {
      const left = indexX * this.tileSize;
      const right = left + this.tileSize;
      const top = indexY * this.tileSize;
      const bottom = top + this.tileSize;

      return { tile, left, right, top, bottom };
    }
  }

  searchByPosition(posX, posY) {
    return this.getByIndex(this.toIndex(posX), this.toIndex(posY));
  }

  searchByRange(x1, x2, y1, y2) {
    const matches = [];
    this.toIndexRange(x1, x2).forEach(indexX => {
      this.toIndexRange(y1, y2).forEach(indexY => {
        const match = this.getByIndex(indexX, indexY);
        if (match)
          matches.push(match);
      });
    });

    return matches;
  }
}

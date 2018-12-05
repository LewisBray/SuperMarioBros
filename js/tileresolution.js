
// Utility functions for resolving positions to tile indices and vice versa

export const TileSize = 16;


export function toIndex(pos) {
  return Math.floor(pos / TileSize);
}


export function getByIndex(tiles, indexX, indexY) {
  const tile = tiles.get(indexX, indexY);
  if (tile) {
    const left = indexX * TileSize;
    const right = left + TileSize;
    const top = indexY * TileSize;
    const bottom = top + TileSize;

    return { tile, left, right, top, bottom };
  }
}


export function searchByRange(tiles, x1, x2, y1, y2) {
  const matches = [];
  toIndexRange(x1, x2).forEach(indexX => {
    toIndexRange(y1, y2).forEach(indexY => {
      const match = getByIndex(tiles, indexX, indexY);
      if (match)
        matches.push(match);
    });
  });

  return matches;
}

function toIndexRange(pos1, pos2) {
  const indexRange = [];

  let index = toIndex(pos1);
  const maxIndex = ((pos2 % TileSize) === 0) ?
    toIndex(pos2) : toIndex(pos2) + 1;

  while (index < maxIndex) {
    indexRange.push(index);
    index += 1;
  }

  return indexRange;
}

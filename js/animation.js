export function animFrameSelectorFactory(frames, frameLength) {
  return distance => {
    const frameIndex = Math.floor(distance / frameLength) % frames.length;
    return frames[frameIndex];
  };
}

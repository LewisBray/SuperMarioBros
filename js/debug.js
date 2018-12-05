export function setupMouseControls(canvas, camera, entity) {
  let lastEvent;

  ['mousedown', 'mousemove'].forEach(eventName => {
    canvas.addEventListener(eventName, event => {
      if (event.buttons === 1) {
        entity.vel.set(0, 0);
        entity.pos.set(event.offsetX + camera.xPos, event.offsetY);
      }
      else if (event.buttons === 2 && lastEvent && lastEvent.buttons === 2 && lastEvent.type === 'mousemove')
        camera.xPos -= event.offsetX - lastEvent.offsetX;

      lastEvent = event;
    });
  });

  canvas.addEventListener('contextmenu', event => event.preventDefault());
}

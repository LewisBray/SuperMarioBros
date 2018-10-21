import Timer from './timer.js';
import Camera from './camera.js';
import {Vec} from './maths.js';
import {loadEntities, createLevelLoader} from './loaders.js';
import {setupKeyboardInput} from './keyhandler.js';
import {setupMouseControls} from './debug.js';
import {createCollisionLayer, createCameraLayer} from './layers.js';


async function main(canvas) {
  const context = screen.getContext('2d');

  const createEntity = await loadEntities();
  const loadLevel = await createLevelLoader(createEntity);
  const level = await loadLevel('1-1');

  const camera = new Camera(new Vec(0, 0), new Vec(26 * 16, 15 * 16));
  window.camera = camera;

  const mario = createEntity.mario();
  const inputHandler = setupKeyboardInput(mario);
  inputHandler.listenTo(window);
  setupMouseControls(screen, camera, mario);

  level.compositor.layers.push(createCollisionLayer(level));
  level.compositor.layers.push(createCameraLayer(camera));

  level.entities.push(mario);

  const timer = new Timer(1/60);
  timer.update = function(deltaTime) {
    level.update(deltaTime);

    if (mario.pos.x > 150)
      camera.pos.x = mario.pos.x - 150;

    // Fill in background background colour before drawing layers,
    // maybe make this a rudementary layer of its own?
    context.fillStyle = level.backgroundColour;
    context.fillRect(0, 0, 26 * 16 + 16, 15 * 16);

    level.compositor.draw(context, camera);
  };

  timer.start();
}


const screen = document.getElementById('screen');
main(screen);

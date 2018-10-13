import Timer from './timer.js';
import Camera from './camera.js';
import {Vec} from './maths.js';
import {loadLevel} from './loaders.js';
import {createMario} from './mario.js';
import {setupKeyboardInput} from './keyhandler.js';
import {setupMouseControls} from './debug.js';
import {createCollisionLayer, createCameraLayer} from './layers.js';


const screen = document.getElementById('screen');
const context = screen.getContext('2d');

// Load everything in parallel then start game logic
Promise.all([
  createMario(),
  loadLevel('1-1')
])
.then(([mario, level]) => {
  const camera = new Camera(new Vec(0, 0), new Vec(26 * 16, 15 * 16));
  window.camera = camera;

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

    level.compositor.draw(context, camera);
  };

  timer.start();
});

import Timer from './timer.js';
import Camera from './camera.js';
import {Vec} from './maths.js';
import {loadEntities, loadLevel} from './loaders.js';
import {setupKeyboardInput} from './keyhandler.js';
import {setupMouseControls} from './debug.js';
import {createCollisionLayer, createCameraLayer} from './layers.js';


const screen = document.getElementById('screen');
const context = screen.getContext('2d');

// Load everything in parallel then start game logic
Promise.all([
  loadEntities(),
  loadLevel('1-1')
])
.then(([createEntity, level]) => {
  console.log(createEntity);
  
  const camera = new Camera(new Vec(0, 0), new Vec(26 * 16, 15 * 16));
  window.camera = camera;

  const mario = createEntity.mario();
  const inputHandler = setupKeyboardInput(mario);
  inputHandler.listenTo(window);
  setupMouseControls(screen, camera, mario);

  const goomba = createEntity.goomba();
  goomba.pos.x = 23 * 16;
  goomba.pos.y = 0;
  goomba.vel.x = -30;

  const koopa = createEntity.koopa();
  koopa.pos.x = 23 * 16;
  koopa.pos.y = 10 * 16;
  koopa.vel.x = -30;

  level.compositor.layers.push(createCollisionLayer(level));
  level.compositor.layers.push(createCameraLayer(camera));

  level.entities.push(mario);
  level.entities.push(goomba);
  level.entities.push(koopa);

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
});

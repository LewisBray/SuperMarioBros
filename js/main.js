import Timer from './timer.js';
import Camera from './camera.js';
import {Vec} from './maths.js';
import {loadLevel} from './loaders.js';
import {loadMario} from './mario.js';
import {loadGoomba} from './goomba.js';
import {loadKoopa} from './koopa.js';
import {setupKeyboardInput} from './keyhandler.js';
import {setupMouseControls} from './debug.js';
import {createCollisionLayer, createCameraLayer} from './layers.js';


const screen = document.getElementById('screen');
const context = screen.getContext('2d');

// Load everything in parallel then start game logic
Promise.all([
  loadMario(),
  loadGoomba(),
  loadKoopa(),
  loadLevel('1-1')
])
.then(([createMario, createGoomba, createKoopa, level]) => {
  const camera = new Camera(new Vec(0, 0), new Vec(26 * 16, 15 * 16));
  window.camera = camera;

  const mario = createMario();
  const inputHandler = setupKeyboardInput(mario);
  inputHandler.listenTo(window);
  setupMouseControls(screen, camera, mario);

  const goomba = createGoomba();
  goomba.pos.x = 23 * 16;
  goomba.pos.y = 0;
  goomba.vel.x = -30;

  const koopa = createKoopa();
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

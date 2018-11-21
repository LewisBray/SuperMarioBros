import Timer from './timer.js';
import Camera from './camera.js';
import {Vec} from './maths.js';
import {setupKeyboardInput} from './keyhandler.js';
import {setupMouseControls} from './debug.js';
import {loadFont, loadEntities, createLevelLoader} from './loaders.js';
import {createCollisionLayer, createCameraLayer, createHUDLayer} from './layers.js';

// List of features to add (for first level at least)
//  - lives (feature of mario?)
//  - death on falling into pit (part of killable trait?)
//  - entry into pipes (no idea yet)
//  - extra rooms (like pipe leading to underground room with coins)
//  - death animations
//  - instant death in certain situations
//  - power-ups
//  - interactable blocks (question blocks, bricks, etc...)
//  - flagpole/level completion animation
//  - score counting
//  - music
//  - sound effects


async function main(canvas) {
  const context = canvas.getContext('2d');

  const [createEntity, fontSet] = await Promise.all([loadEntities(), loadFont()]);
  const loadLevel = await createLevelLoader(createEntity);
  const level = await loadLevel('1-1');

  const camera = new Camera(new Vec(0, 0), new Vec(26 * 16, 15 * 16));

  const mario = createEntity.mario();
  const inputHandler = setupKeyboardInput(mario);
  inputHandler.listenTo(window);
  setupMouseControls(canvas, camera, mario);

  level.compositor.layers.push(createCollisionLayer(level));
  level.compositor.layers.push(createCameraLayer(camera));
  level.compositor.layers.push(createHUDLayer(fontSet, level));

  level.entities.push(mario);

  const timer = new Timer(1/60);
  timer.update = function(deltaTime) {
    level.update(deltaTime);

    camera.pos.x = Math.max(0, mario.pos.x - 150);

    level.compositor.draw(context, camera);
  };

  timer.start();
}


const screen = document.getElementById('screen');
main(screen);

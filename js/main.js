import Timer from './timer.js';
import Camera from './camera.js';
import {createLevel} from './level.js';
import {setupKeyboardInput} from './keyhandler.js';
import {setupMouseControls} from './debug.js';
import {loadJSON, loadEntities, loadLayersToDraw} from './loaders.js';

// List of features to add (for first level at least)
//  - lives (feature of mario?)
//  - entry into pipes (no idea yet)
//  - extra rooms (like pipe leading to underground room with coins)
//  - death animations (do enemies flip upside down when killed by sliding koopa shell?)
//  - power-ups
//  - interactable blocks (question blocks, bricks, etc...)
//  - flagpole/level completion animation
//  - score counting
//  - music
//  - sound effects
//  - some small pointless files that could contain more/be gotten rid of

async function main(canvas) {
  const context = canvas.getContext('2d');
  const levelName = '1-1';

  const [levelSpec, createEntity] = await Promise.all([
    loadJSON(`/js/levels/${levelName}.json`),
    loadEntities()
  ]);

  const level = createLevel(levelName, levelSpec, createEntity);
  
  const camera = new Camera(26 * 16, 15 * 16);
  
  const mario = createEntity.mario();
  const inputHandler = setupKeyboardInput(mario);
  inputHandler.listenTo(window);
  setupMouseControls(canvas, camera, mario);
  level.entities.push(mario);
  
  const layersToDraw = await loadLayersToDraw(level, levelSpec, camera);
  
  const timer = new Timer(1/60);
  timer.update = function(deltaTime) {
    level.update(deltaTime);
    camera.followEntity(mario, level.length);
    layersToDraw.forEach(drawLayer => drawLayer(context, camera));
  };

  timer.start();
}


const screen = document.getElementById('screen');
main(screen);

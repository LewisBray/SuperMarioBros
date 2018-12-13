import Timer from './timer.js';
import Camera from './camera.js';
import {createLevel} from './level.js';
import {setupKeyboardInput} from './keyhandler.js';
import {setupMouseControls} from './debug.js';
import {loadJSON, loadEntities, loadLayersToDraw} from './loaders.js';

// List of features to add (for first level at least)
//  - lives (feature of mario?)
//  - entry into pipes (draw entities between scenery and collision layers and find way of animating "cutscenes")
//  - extra rooms (like pipe leading to underground room with coins, need to be able to freeze level updating)
//  - death animations (enemies flip upside down when killed by sliding koopa shell)
//  - power-ups (will probably want to split collision and scenery layers up and put entities between them)
//  - flagpole/level completion animation (need way of animating "cutscenes")
//  - bonus points for combos (need booleans in koopa entity to keep track of it all)
//  - music (won't autoplay without user interaction, will be fixed when we have a menu screen)
//  - some small pointless files that could contain more/be gotten rid of
//  - optimise music handling in level update loop
//  - have less string checking and use symbols to optimise performance, particularly in things like tile collision

async function main(canvas) {
  const context = canvas.getContext('2d');
  const levelName = '1-1';

  const [levelSpec, createEntity] = await Promise.all([
    loadJSON(`/js/specifications/levels/${levelName}.json`),
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
  timer.update = deltaTime => {
    level.update(deltaTime);
    camera.followEntity(mario, level.length);
    layersToDraw.forEach(drawLayer => drawLayer(context, camera));
  };

  timer.start();
}

const screen = document.getElementById('screen');
main(screen);

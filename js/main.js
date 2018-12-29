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
//  - don't need to store tile type since separating layers and less checking needed in tile collision detection
//  - use async/await over promises for readability
//  - tiles that are being bumped should interact with entities above them
//  - level class getting big, maybe break into smaller entities and make a GameState object to update?
//  - make a player input object to update before game state, game state would use player input object to update
//  - relative paths for files
//  - invisible objects (i.e. 1-up mushroom in invisible block)

// Optimisations
//  - object pooling for entities
//  - use symbols over strings? (I'm guessing there's a performance increase, if not use ints?)
//  - reduce number of maps
//  - don't calculate score and coins collected every frame
//  - look at offscreen buffers again, seems weird how performance gets worse for me
//  - remove camera layer
//  - make canvas size the final size and adjust everything accordingly
//  - write own array item removal function that doesn't return anything (reduces garbage to collect)
//  - make sure no functions/objects are created inside game loop if not necessary
//  - pull as much as possible out of game loop functions
//  - canvas property setting is expensive (apparently) so remove from game loop
//  - don't need to create array of candidate collision tiles, just check overlap and reference tile to bump

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
    level.update(deltaTime, createEntity);
    camera.followEntity(mario, level.length);
    layersToDraw.forEach(drawLayer => drawLayer(context, camera));
  };

  timer.start();
}

const screen = document.getElementById('screen');
main(screen);

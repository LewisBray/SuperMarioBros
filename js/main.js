import Timer from './timer.js';
import KeyHandler from './keyhandler.js';
import {loadLevel} from './loaders.js';
import {createMario} from './mario.js';


const context = document.getElementById('screen').getContext('2d');

// Just setting up a background so I can see where the canvas ends
context.fillStyle = '#DFDFDF';
context.fillRect(0, 0, document.getElementById('screen').width, document.getElementById('screen').width);


// Load everything in parallel then start game logic
Promise.all([
  createMario(),
  loadLevel('1-1')
])
.then(([mario, level]) => {
  const inputHandler = new KeyHandler();
  inputHandler.addMapping(32, keyState => {
    if (keyState === 1)
      mario.jump.start();
    else
      mario.jump.cancel();
  });
  inputHandler.listenTo(window);

  level.entities.push(mario);

  const gravity = 1000;
  const timer = new Timer(1/60);
  timer.update = function(deltaTime) {
    level.update(deltaTime);
    level.compositor.draw(context);
    mario.vel.y += gravity * deltaTime;
  };

  timer.start();
});

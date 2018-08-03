import Timer from './timer.js';
import {loadLevel} from './loaders.js';
import {createMario} from './mario.js';
import {setupKeyboardInput} from './keyhandler.js';


const screen = document.getElementById('screen');
const context = screen.getContext('2d');

// Just setting up a background so I can see where the canvas ends
context.fillStyle = '#DFDFDF';
context.fillRect(0, 0, screen.width, screen.width);


// Load everything in parallel then start game logic
Promise.all([
  createMario(),
  loadLevel('1-1')
])
.then(([mario, level]) => {
  const inputHandler = setupKeyboardInput(mario);
  inputHandler.listenTo(window);

  ['mousedown', 'mousemove'].forEach(eventName => {
    screen.addEventListener(eventName, event => {
      if (event.buttons === 1)
        mario.vel.set(0, 0);
        mario.pos.set(event.offsetX, event.offsetY);
    });
  });

  level.entities.push(mario);

  const timer = new Timer(1/60);
  timer.update = function(deltaTime) {
    level.update(deltaTime);
    level.compositor.draw(context);
  };

  timer.start();
});

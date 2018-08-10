
const PRESSED = 1;
const RELEASED = 0;

// Handles keyboard inputs from the player
class KeyHandler {
  constructor() {
    this.keyStates = new Map();   // State of key (pressed or not)
    this.keyMaps = new Map();     // Maps key to consequence function
  }

  addMapping(code, callback) {
    this.keyMaps.set(code, callback);
  }

  handleEvent(event) {
    const {code} = event;

    if (!this.keyMaps.has(code))
      return;

    event.preventDefault();

    const keyState = (event.type === 'keydown') ? PRESSED : RELEASED;

    // Get out early if button already pressed/released
    if (this.keyStates.get(code) === keyState)
      return;

    this.keyStates.set(code, keyState);

    this.keyMaps.get(code)(keyState);
  }

  listenTo(window) {
    ['keydown', 'keyup'].forEach(eventName => {
      window.addEventListener(eventName, event => {
        this.handleEvent(event);
      });
    });
  }
}


export function setupKeyboardInput(entity) {
  const inputHandler = new KeyHandler();

  inputHandler.addMapping('Space', keyState => {
    if (keyState === 1)
      entity.jump.start();
    else
      entity.jump.cancel();
  });

  inputHandler.addMapping('ArrowLeft', keyState => {
    entity.move.direction = -keyState;
  });

  inputHandler.addMapping('ArrowRight', keyState => {
    entity.move.direction = keyState;
  });

  return inputHandler;
}

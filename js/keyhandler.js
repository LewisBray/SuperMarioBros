
const PRESSED = 1;
const RELEASED = 0;

// Handles keyboard inputs from the player
export default class KeyHandler {
  constructor() {
    this.keyStates = new Map();   // State of key (pressed or not)
    this.keyMaps = new Map();     // Maps key to consequence function
  }

  addMapping(keyCode, callback) {
    this.keyMaps.set(keyCode, callback);
  }

  handleEvent(event) {
    const {keyCode} = event;

    if (!this.keyMaps.has(keyCode))
      return;

    event.preventDefault();

    const keyState = (event.type === 'keydown') ? PRESSED : RELEASED;

    // Get out early if button already pressed/released
    if (this.keyStates.get(keyCode) === keyState)
      return;

    this.keyStates.set(keyCode, keyState);

    this.keyMaps.get(keyCode)(keyState);
  }

  listenTo(window) {
    ['keydown', 'keyup'].forEach(eventName => {
      window.addEventListener(eventName, event => {
        this.handleEvent(event);
      });
    });
  }
}

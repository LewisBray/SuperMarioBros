export default class Font {
  constructor(fontSet, fontSize) {
    this.fontSet = fontSet;
    this.fontSize = fontSize;
  }

  print(text, context, x, y) {
    [...text].forEach((character, index) => {
      this.fontSet.draw(character, context, x + index * this.fontSize, y);
    });
  }
}
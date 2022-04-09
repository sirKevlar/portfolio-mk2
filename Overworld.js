class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector('.game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.map = null;
  }

  startGameLoop() {
    const step = () => {
      //draw lower layer
      this.map.drawLowerImage(this.ctx);

      //draw game objects
      Object.values(this.map.gameObjects).forEach((object) => {
        object.sprite.draw(this.ctx);
      });

      requestAnimationFrame(() => {
        step();
      });
    };
    step();
  }

  init() {
    this.map = new OverworldMap(window.OverworldMaps.Office);
    this.startGameLoop();
  }
}

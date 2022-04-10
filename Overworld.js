class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector('.game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.map = null;
  }

  startGameLoop() {
    const step = () => {
      //clear drawing before each frame is drawn
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //draw lower layer
      this.map.drawLowerImage(this.ctx);

      //draw game objects
      Object.values(this.map.gameObjects).forEach((object) => {
        object.update({
          arrow: this.directionInput.direction,
        });
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

    this.directionInput = new DirectionInput();
    this.directionInput.init();
    this.directionInput.direction;

    this.startGameLoop();
  }
}

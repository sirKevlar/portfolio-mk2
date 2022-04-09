class Sprite {
  constructor(config) {
    // Setup image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    };

    // Config animation & state
    this.animations = config.animations || {
      idleRight: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ],
      walkRight: [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
        [5, 1],
      ],
      idleLeft: [
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [5, 5],
      ],
      walkLeft: [
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6],
        [5, 6],
      ],
    };
    this.currentAnimation = config.currentAnimation || 'idleRight';
    this.currentAnimationFrame = 0;

    //Reference game object
    this.gameObject = config.gameObject;
  }

  draw(ctx) {
    const x = this.gameObject.x * 16 - 14;
    const y = this.gameObject.y * 16 + 8;

    this.isLoaded && ctx.drawImage(
      this.image,
      0,
      0, //start co-ord for cut x,y
      48,
      48, //size of cut x,y
      x,
      y, //position x,y
      48,
      48 //draw size x,y
    );
  }
}

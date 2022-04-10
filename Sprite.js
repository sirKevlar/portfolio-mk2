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
      "idle-right": [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ],
      "walk-right": [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
        [5, 1],
      ],
      "idle-left": [
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [5, 5],
      ],
      "walk-left": [
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6],
        [5, 6],
      ],
      "idle-down": [
        [0, 10],
        [1, 10],
        [2, 10],
        [3, 10],
        [4, 10],
        [5, 10],
      ],
      "walk-down": [
        [0, 11],
        [1, 11],
        [2, 11],
        [3, 11],
        [4, 11],
        [5, 11],
      ],
      "idle-up": [
        [0, 12],
        [1, 12],
        [2, 12],
        [3, 12],
        [4, 12],
        [5, 12],
      ],
      "walk-up": [
        [0, 13],
        [1, 13],
        [2, 13],
        [3, 13],
        [4, 13],
        [5, 13],
      ],
    };
    this.currentAnimation = config.currentAnimation || 'idle-right';
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 16;
    this.animationFrameProgress = this.animationFrameLimit;

    //Reference game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(key) {
    if (this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    //downtick frame progress
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    //reset counter
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0;
    }
  }

  draw(ctx) {
    const x = this.gameObject.x - 14;
    const y = this.gameObject.y + 8;

    const [frameX, frameY] = this.frame;

    this.isLoaded &&
      ctx.drawImage(
        this.image,
        frameX * 48,
        frameY * 48, //start co-ord for cut x,y
        48,
        48, //size of cut x,y
        x,
        y, //position x,y
        48,
        48 //draw size x,y
      );
    this.updateAnimationProgress();
  }
}

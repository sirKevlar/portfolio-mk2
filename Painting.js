class Painting extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      imgSrc: config.imgSrc,
      animations: {
        still: [[0, 0]],
      },
      currentAnimation: 'still',
    });
    this.clickAction = [
      {
        events: [
          {
            type: 'textMessage',
            text: `when you click me, i will display ${config.imgSrc}`,
          },
        ],
      },
    ];
  }
}

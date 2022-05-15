class EmbedDisplay extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      animations: {
        still: [[0, 0]],
      },
      currentAnimation: 'still',
    });
    this.clickAction = [
      {
        events: [
          {
            type: 'displayEmbed',
            src: config.embedSrc,
            description: config.description,
          },
        ],
      },
    ];
  }
}

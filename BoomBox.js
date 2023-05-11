class BoomBox extends GameObject {
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
            type: 'displayMp3s',
            album: config.album,
            mp3s: config.mp3s,
            descriptions: config.descriptions,
            cover: config.cover,
            coverDescription: config.coverDescription,
          },
          {
            type: 'displayImageAndText',
            src: config.srcs[0],
            description: config.imageDescriptions[0],
            text: config.texts[0],
          },
          {
            type: 'displayImageAndText',
            src: config.srcs[1],
            description: config.imageDescriptions[1],
            text: config.texts[1],
          },
          {
            type: 'displayImageAndText',
            src: config.srcs[2],
            description: config.imageDescriptions[2],
            text: config.texts[2],
          },
        ],
      },
    ];
  }
}

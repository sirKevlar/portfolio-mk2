class VideoDisplay extends GameObject {
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
            type: 'displayVideos',
            videos: config.videos,
            descriptions: config.descriptions,
          },
        ],
      },
    ];
  }
}

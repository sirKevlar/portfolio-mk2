class RecordPress extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: '/assets/objects/record-press.png',
      animations: {
        'used-down': [[0, 0]],
        'unused-down': [[1, 0]],
      },
      currentAnimation: 'used-down',
    });
    this.storyFlag = config.storyFlag;
    this.records = config.records;
    this.clickAction = [
      {
        required: [this.storyFlag],
        events: [{ type: 'textMessage', text: 'You have already used this.' }],
      },
      {
        events: [
          {
            type: 'textMessage',
            text: 'Ready to press your own vinyl?...',
          },
          { type: 'craftingMenu', records: this.records },
          { type: 'addStoryFlag', flag: this.storyFlag },
        ],
      },
    ];
  }

  update() {
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? 'used-down'
      : 'unused-down';
  }
}

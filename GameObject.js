class GameObject {
  constructor(config) {
    this.id = null;
    this.isMounted = false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || 'right';
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || './assets/characters/player.png',
    });

    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;

    this.clickAction = config.clickAction || [];
  }

  mount(map) {
    this.isMounted = true;
    map.addWall(this.x, this.y);

    //if we have behavior, launch after delay
    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 10);
  }

  update() {}

  async doBehaviorEvent(map) {
    //do nothing if higher priority things are happening
    if (
      map.isCutscenePlaying ||
      this.behaviorLoop.length === 0 ||
      this.isStanding ||
      this.isWalking
    ) {
      return;
    }

    //config event
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;

    //create event instance from next event config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    //fire next event
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    }
    //Do it again
    this.doBehaviorEvent(map);
  }
}

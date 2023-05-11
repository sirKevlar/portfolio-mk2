class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      {
        map: this.map,
      },
      {
        type: 'stand',
        direction: this.event.direction,
        time: this.event.time,
      }
    );
    //handler to complete when sprite finishes standing & resolves event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener('PersonStandComplete', completeHandler);
        resolve();
      }
    };

    document.addEventListener('PersonStandComplete', completeHandler);
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      {
        map: this.map,
      },
      {
        type: 'walk',
        direction: this.event.direction,
        retry: true,
      }
    );
    //handler to complete when sprite finishes walking & resolves event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener('PersonWalkingComplete', completeHandler);
        resolve();
      }
    };

    document.addEventListener('PersonWalkingComplete', completeHandler);
  }

  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(
        this.map.gameObjects['hero'].direction
      );
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(),
    });
    message.init(document.querySelector('.game-container'));
  }

  displayEmbed(resolve) {
    const embed = new DisplayEmbed({
      src: this.event.src,
      description: this.event.description,
      onComplete: () => resolve(),
    });
    embed.init(document.querySelector('.game-container'));
  }

  displayImage(resolve) {
    const image = new DisplayImage({
      src: this.event.src,
      description: this.event.description,
      onComplete: () => resolve(),
    });
    image.init(document.querySelector('.game-container'));
  }

  displayImageAndText(resolve) {
    const imageAndText = new DisplayImageAndText({
      src: this.event.src,
      description: this.event.description,
      text: this.event.text,
      onComplete: () => resolve(),
    });
    imageAndText.init(document.querySelector('.game-container'));
  }

  displayVideos(resolve) {
    const videoGallery = new DisplayVideos({
      videos: this.event.videos,
      descriptions: this.event.descriptions,
      onComplete: () => resolve(),
    });
    videoGallery.init(document.querySelector('.game-container'));
  }

  displayMp3s(resolve) {
    const mp3Gallery = new DisplayMp3s({
      album: this.event.album,
      mp3s: this.event.mp3s,
      descriptions: this.event.descriptions,
      cover: this.event.cover,
      coverDescription: this.event.coverDescription,
      onComplete: () => resolve(),
    });
    mp3Gallery.init(document.querySelector('.game-container'));
  }

  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector('.game-container'), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();

      sceneTransition.fadeOut();
    });
  }

  battle(resolve) {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId],
      onComplete: () => {
        resolve();
      },
    });
    battle.init(document.querySelector('.game-container'));
  }

  pause(resolve) {
    console.log('PAUSE PRESSED');
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      },
    });
    menu.init(document.querySelector('.game-container'));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  repairVinyl(resolve) {
    window.playerState.repairRecords();
    resolve();
  }

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      records: this.event.records,
      onComplete: () => {
        resolve();
      },
    });
    menu.init(document.querySelector('.game-container'));
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}

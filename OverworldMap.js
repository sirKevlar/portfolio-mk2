class OverworldMap {
  constructor(config) {
    this.gameObjects = config.gameObjects;

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    //   this.upperImage = new Image();
    //   this.upperImage.Src = config.upperSrc;
  }

  drawLowerImage(ctx) {
    ctx.drawImage(this.lowerImage, 0, 0);
  }

  //   drawUpperImage(ctx) {
  //     ctx.drawImage(this.upperImage, 0, 0);
  //   }
}

window.OverworldMaps = {
  Office: {
    lowerSrc: '/assets/maps/office.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(2),
      }),
    },
  },
  GamesRoom: {
    lowerSrc: '/assets/maps/gamesRoom.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(16),
        y: utils.withGrid(8),
      }),
    },
  },
  MusicRoom: {
    lowerSrc: '/assets/maps/musicRoom.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(4),
        y: utils.withGrid(3),
      }),
    },
  },
  LivingArea: {
    lowerSrc: '/assets/maps/livingArea.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(4),
        y: utils.withGrid(3),
      }),
    },
  },
  OutsideLeft: {
    lowerSrc: '/assets/maps/outsideLeft.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(8),
      }),
    },
  },
  OutsideRight: {
    lowerSrc: '/assets/maps/outsideRight.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(10),
      }),
    },
  },
};

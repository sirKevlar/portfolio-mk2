class OverworldMap {
  constructor(config) {
    this.gameObject = config.gameObjects;

    this.lowerImage = new Image();
    this.lowerImage.Src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.Src = config.upperSrc;
  }

  drawLowerImage(ctx) {
    ctx.drawImage(this.lowerImage, 0, 0);
  }

  drawUpperImage(ctx) {
    ctx.drawImage(this.upperImage, 0, 0);
  }
}

window.overworldMaps = {
  Office: {
    lowerSrc: '/assets/maps/office.png',
    gameObjects: {
      hero: new GameObject({
        x: 3,
        y: 2,
      }),
    },
  },
  GamesRoom: {
    lowerSrc: '/assets/maps/office.png',
    gameObjects: {
      hero: new GameObject({
        x: 4,
        y: 3,
      }),
    },
  },
  // MusicRoom: {

  // },
  // LivingArea: {

  // },
  // OutsideLeft: {

  // },
  // OutsideRight: {

  // }
};

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
      hero: new GameObject({
        x: 10,
        y: 2,
      }),
    },
  },
  GamesRoom: {
    lowerSrc: '/assets/maps/gamesRoom.png',
    gameObjects: {
      hero: new GameObject({
        x: 16,
        y: 8,
      }),
    },
  },
  MusicRoom: {
    lowerSrc: '/assets/maps/musicRoom.png',
    gameObjects: {
      hero: new GameObject({
        x: 4,
        y: 3,
      }),
    },
  },
  LivingArea: {
    lowerSrc: '/assets/maps/livingArea.png',
    gameObjects: {
      hero: new GameObject({
        x: 4,
        y: 3,
      }),
    },
  },
  OutsideLeft: {
    lowerSrc: '/assets/maps/outsideLeft.png',
    gameObjects: {
      hero: new GameObject({
        x: 4,
        y: 3,
      }),
    },
  },
  OutsideRight: {
    lowerSrc: '/assets/maps/outsideRight.png',
    gameObjects: {
      hero: new GameObject({
        x: 4,
        y: 3,
      }),
    },
  },
};

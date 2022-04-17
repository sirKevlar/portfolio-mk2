class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.Src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraFocusItem) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(15) - cameraFocusItem.x,
      utils.withGrid(7.5) - cameraFocusItem.y
    );
  }

  drawUpperImage(ctx, cameraFocusItem) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(15) - cameraFocusItem.x,
      utils.withGrid(7.5) - cameraFocusItem.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.id = key;

      //todo: determine if this object should mount
      object.mount(this);
    });
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    for (let i = 0; i < events.length; i++) {
      if (events[i].type === 'changeMap') {
        return;
      }
    }

    //reset NPCs
    Object.values(this.gameObjects).forEach((object) =>
      object.doBehaviorEvent(this)
    );
  }

  checkForActionCutscene() {
    const hero = this.gameObjects['hero'];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` == `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.clickAction.length) {
      this.startCutscene(match.clickAction[0].events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects['hero'];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

window.OverworldMaps = {
  Office: {
    lowerSrc: '/assets/maps/office.png',
    upperSrc: '/assets/maps/officeUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(2),
      }),
      coffeeTableNote: new GameObject({
        x: utils.withGrid(16),
        y: utils.withGrid(8),
        src: '/assets/characters/blankSquare.png',
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: 'Well done for making it this far! You\'re an actual genius. Have a wander and hit "ENTER" when looking at stuff and you might see some of Kev\'s various projects',
              },
              {
                type: 'textMessage',
                text: 'This house has 4 rooms: The office (this room) - Features React projects and APIs and other office-y things',
              },
              {
                type: 'textMessage',
                text: "The games room (due east of this room) - Yep you guessed it! Features game projects, including this one (it's Inception all over again)",
              },
              {
                type: 'textMessage',
                text: "The music room (north east of this room) - Yep you guessed it again! Features music projects, including Kev's album Flat Pack Gallows",
              },
              {
                type: 'textMessage',
                text: 'The living room (due north of this room) - This room contains far too much personal information about Kev... Do you really want to go down that rabbit hole?...',
              },
              {
                type: 'textMessage',
                text: 'Massive thanks to Drew Conley (check out his YouTube channel) for your help and for creating the video series which is the foundation of this site and also to the Game Dev Shift Discord group for all your help too',
              },
              {
                type: 'textMessage',
                text: "Finally a word of warning... Don't go thru the south door of the office or games room, lest ye will perish!....... Happy exploring",
              },
            ],
          },
        ],
      }),
      deskLaptop: new GameObject({
        x: utils.withGrid(16),
        y: utils.withGrid(0),
        src: '/assets/characters/blankSquare.png',
      }),
      conferenceTableLaptopRight: new GameObject({
        x: utils.withGrid(4),
        y: utils.withGrid(2),
        src: '/assets/characters/blankSquare.png',
      }),
      conferenceTableLaptopLeft: new GameObject({
        x: utils.withGrid(3),
        y: utils.withGrid(2),
        src: '/assets/characters/blankSquare.png',
      }),
      greenSlime: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(1),
        src: '/assets/characters/greenSlime.png',
      }),
      slime: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(9),
        src: '/assets/characters/slime.png',
        behaviorLoop: [
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'stand', direction: 'left', time: 1400 },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'stand', direction: 'right', time: 1100 },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
        ],
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall start
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 12)]: true, //left wall end
      [utils.asGridCoord(1, -1)]: true, //top wall left start
      [utils.asGridCoord(2, -1)]: true,
      [utils.asGridCoord(3, -1)]: true,
      [utils.asGridCoord(4, -1)]: true,
      [utils.asGridCoord(5, -1)]: true,
      [utils.asGridCoord(6, -1)]: true,
      [utils.asGridCoord(7, -1)]: true,
      [utils.asGridCoord(8, -1)]: true,
      [utils.asGridCoord(8, -2)]: true, //top wall left end
      [utils.asGridCoord(7, 0)]: true, //plant left start
      [utils.asGridCoord(8, 0)]: true, //plant left end
      [utils.asGridCoord(12, 0)]: true, //plant right
      [utils.asGridCoord(15, 0)]: true, //upper desk start
      [utils.asGridCoord(16, 0)]: true,
      [utils.asGridCoord(17, 0)]: true, //upper desk end
      [utils.asGridCoord(12, -2)]: true, //top wall right start
      [utils.asGridCoord(12, -1)]: true,
      [utils.asGridCoord(13, -1)]: true,
      [utils.asGridCoord(14, -1)]: true,
      [utils.asGridCoord(15, -1)]: true,
      [utils.asGridCoord(16, -1)]: true,
      [utils.asGridCoord(17, -1)]: true,
      [utils.asGridCoord(18, -1)]: true,
      [utils.asGridCoord(19, -1)]: true,
      [utils.asGridCoord(20, -1)]: true, //top wall right end
      [utils.asGridCoord(20, 0)]: true, //right wall top start
      [utils.asGridCoord(20, 1)]: true,
      [utils.asGridCoord(20, 2)]: true,
      [utils.asGridCoord(20, 3)]: true, //right wall top end
      [utils.asGridCoord(20, 7)]: true, //right wall bottom start
      [utils.asGridCoord(20, 8)]: true,
      [utils.asGridCoord(20, 9)]: true,
      [utils.asGridCoord(20, 10)]: true,
      [utils.asGridCoord(20, 11)]: true, //right wall bottom end
      [utils.asGridCoord(20, 12)]: true, //bottom wall right end
      [utils.asGridCoord(19, 12)]: true,
      [utils.asGridCoord(18, 12)]: true,
      [utils.asGridCoord(17, 12)]: true,
      [utils.asGridCoord(16, 12)]: true,
      [utils.asGridCoord(15, 12)]: true,
      [utils.asGridCoord(14, 12)]: true,
      [utils.asGridCoord(13, 12)]: true,
      [utils.asGridCoord(12, 12)]: true, //bottom wall right start
      [utils.asGridCoord(8, 12)]: true, //bottom wall left end
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(5, 12)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(1, 12)]: true, //bottom wall left start
      [utils.asGridCoord(2, 2)]: true, //conference table
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(2, 5)]: true,
      [utils.asGridCoord(2, 6)]: true,
      [utils.asGridCoord(2, 7)]: true,
      [utils.asGridCoord(3, 2)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(3, 5)]: true,
      [utils.asGridCoord(3, 6)]: true,
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(4, 2)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(4, 4)]: true,
      [utils.asGridCoord(4, 5)]: true,
      [utils.asGridCoord(4, 6)]: true,
      [utils.asGridCoord(4, 7)]: true,
      [utils.asGridCoord(5, 2)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(5, 4)]: true,
      [utils.asGridCoord(5, 5)]: true,
      [utils.asGridCoord(5, 6)]: true,
      [utils.asGridCoord(5, 7)]: true, //conference table end
      [utils.asGridCoord(15, 6)]: true, //sofa start
      [utils.asGridCoord(16, 6)]: true,
      [utils.asGridCoord(17, 6)]: true, //sofa end
      [utils.asGridCoord(15, 8)]: true, //coffee table start
      [utils.asGridCoord(16, 8)]: true,
      [utils.asGridCoord(17, 8)]: true, //coffee table end
    },
    cutsceneSpaces: {
      [utils.asGridCoord(16, 1)]: [
        {
          events: [
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
            {
              type: 'textMessage',
              text: 'The green slime is disappointed you are going to the static site. He suggests that by skipping the game, you may be missing the best project...',
            },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'left' },
            { who: 'greenSlime', type: 'walk', direction: 'right' },
          ],
        },
      ],
      [utils.asGridCoord(9, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'LivingArea' }],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'LivingArea' }],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'LivingArea' }],
        },
      ],
      [utils.asGridCoord(20, 4)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(20, 5)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(20, 6)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(9, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideLeft' }],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideLeft' }],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideLeft' }],
        },
      ],
    },
  },
  GamesRoom: {
    lowerSrc: '/assets/maps/gamesRoom.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(4),
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall top start
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true, //left wall top end
      [utils.asGridCoord(0, 7)]: true, //left wall bottom start
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 12)]: true, //left wall bottom end
      [utils.asGridCoord(1, -1)]: true, //top wall left start
      [utils.asGridCoord(2, -1)]: true,
      [utils.asGridCoord(3, -1)]: true,
      [utils.asGridCoord(4, -1)]: true,
      [utils.asGridCoord(5, -1)]: true,
      [utils.asGridCoord(6, -1)]: true,
      [utils.asGridCoord(7, -1)]: true,
      [utils.asGridCoord(8, -1)]: true, //top wall left end
      [utils.asGridCoord(12, -1)]: true, //top wall right start
      [utils.asGridCoord(13, -1)]: true,
      [utils.asGridCoord(14, -1)]: true,
      [utils.asGridCoord(15, -1)]: true,
      [utils.asGridCoord(16, -1)]: true,
      [utils.asGridCoord(17, -1)]: true,
      [utils.asGridCoord(18, -1)]: true,
      [utils.asGridCoord(19, -1)]: true,
      [utils.asGridCoord(20, -1)]: true, //top wall right end
      [utils.asGridCoord(20, 0)]: true, //right start
      [utils.asGridCoord(20, 1)]: true,
      [utils.asGridCoord(20, 2)]: true,
      [utils.asGridCoord(20, 3)]: true,
      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(20, 5)]: true,
      [utils.asGridCoord(20, 6)]: true,
      [utils.asGridCoord(20, 7)]: true,
      [utils.asGridCoord(20, 8)]: true,
      [utils.asGridCoord(20, 9)]: true,
      [utils.asGridCoord(20, 10)]: true,
      [utils.asGridCoord(20, 11)]: true, //right wall end
      [utils.asGridCoord(20, 12)]: true, //bottom wall right end
      [utils.asGridCoord(19, 12)]: true,
      [utils.asGridCoord(18, 12)]: true,
      [utils.asGridCoord(17, 12)]: true,
      [utils.asGridCoord(16, 12)]: true,
      [utils.asGridCoord(15, 12)]: true,
      [utils.asGridCoord(14, 12)]: true,
      [utils.asGridCoord(13, 12)]: true,
      [utils.asGridCoord(12, 12)]: true, //bottom wall right start
      [utils.asGridCoord(8, 12)]: true, //bottom wall left end
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(5, 12)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(1, 12)]: true, //bottom wall left start
      [utils.asGridCoord(1, 0)]: true, //arcade machine left
      [utils.asGridCoord(2, 0)]: true, //arcade machine left
      [utils.asGridCoord(5, 0)]: true, //bench left
      [utils.asGridCoord(6, 0)]: true, //bench left
      [utils.asGridCoord(8, 0)]: true, //plant left
      [utils.asGridCoord(12, 0)]: true, //plant right
      [utils.asGridCoord(13, 0)]: true, //plant right
      [utils.asGridCoord(14, 0)]: true, //bench right
      [utils.asGridCoord(15, 0)]: true, //bench right
      [utils.asGridCoord(18, 0)]: true, //arcade machine right
      [utils.asGridCoord(19, 0)]: true, //arcade machine right
      [utils.asGridCoord(7, 3)]: true, //pool table
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(11, 3)]: true,
      [utils.asGridCoord(12, 3)]: true,
      [utils.asGridCoord(13, 3)]: true,
      [utils.asGridCoord(7, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(10, 4)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(12, 4)]: true,
      [utils.asGridCoord(13, 4)]: true,
      [utils.asGridCoord(7, 5)]: true,
      [utils.asGridCoord(8, 5)]: true,
      [utils.asGridCoord(9, 5)]: true,
      [utils.asGridCoord(10, 5)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(12, 5)]: true,
      [utils.asGridCoord(13, 5)]: true,
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(9, 6)]: true,
      [utils.asGridCoord(10, 6)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(12, 6)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
      [utils.asGridCoord(9, 7)]: true,
      [utils.asGridCoord(10, 7)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(12, 7)]: true,
      [utils.asGridCoord(13, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(9, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'MusicRoom' }],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'MusicRoom' }],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'MusicRoom' }],
        },
      ],
      [utils.asGridCoord(0, 4)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(0, 5)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(0, 6)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(9, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideRight' }],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideRight' }],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideRight' }],
        },
      ],
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
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall top start
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true, //left wall top end
      [utils.asGridCoord(0, 7)]: true, //left wall bottom start
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 12)]: true, //left wall end
      [utils.asGridCoord(1, -1)]: true, //top wall left start
      [utils.asGridCoord(2, -1)]: true,
      [utils.asGridCoord(3, -1)]: true,
      [utils.asGridCoord(4, -1)]: true,
      [utils.asGridCoord(5, -1)]: true,
      [utils.asGridCoord(6, -1)]: true,
      [utils.asGridCoord(7, -1)]: true,
      [utils.asGridCoord(8, -1)]: true,
      [utils.asGridCoord(9, -1)]: true,
      [utils.asGridCoord(10, -1)]: true,
      [utils.asGridCoord(11, -1)]: true,
      [utils.asGridCoord(12, -1)]: true,
      [utils.asGridCoord(13, -1)]: true,
      [utils.asGridCoord(14, -1)]: true,
      [utils.asGridCoord(15, -1)]: true,
      [utils.asGridCoord(16, -1)]: true,
      [utils.asGridCoord(17, -1)]: true,
      [utils.asGridCoord(18, -1)]: true,
      [utils.asGridCoord(19, -1)]: true,
      [utils.asGridCoord(20, -1)]: true, //top wall right end
      [utils.asGridCoord(20, 0)]: true, //right wall top start
      [utils.asGridCoord(20, 1)]: true,
      [utils.asGridCoord(20, 2)]: true,
      [utils.asGridCoord(20, 3)]: true,
      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(20, 5)]: true,
      [utils.asGridCoord(20, 6)]: true,
      [utils.asGridCoord(20, 7)]: true,
      [utils.asGridCoord(20, 8)]: true,
      [utils.asGridCoord(20, 9)]: true,
      [utils.asGridCoord(20, 10)]: true,
      [utils.asGridCoord(20, 11)]: true, //right wall bottom end
      [utils.asGridCoord(20, 12)]: true, //bottom wall right end
      [utils.asGridCoord(19, 12)]: true,
      [utils.asGridCoord(18, 12)]: true,
      [utils.asGridCoord(17, 12)]: true,
      [utils.asGridCoord(16, 12)]: true,
      [utils.asGridCoord(15, 12)]: true,
      [utils.asGridCoord(14, 12)]: true,
      [utils.asGridCoord(13, 12)]: true,
      [utils.asGridCoord(12, 12)]: true, //bottom wall right start
      [utils.asGridCoord(8, 12)]: true, //bottom wall left end
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(5, 12)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(1, 12)]: true, //bottom wall left start
      [utils.asGridCoord(1, 0)]: true, //guitarL
      [utils.asGridCoord(2, 0)]: true, //guitarL
      [utils.asGridCoord(6, 0)]: true, //keyboard
      [utils.asGridCoord(7, 0)]: true,
      [utils.asGridCoord(8, 0)]: true, //keys end
      [utils.asGridCoord(15, 0)]: true, //guitar&bass
      [utils.asGridCoord(16, 0)]: true,
      [utils.asGridCoord(17, 0)]: true, //guitar&bass end
      [utils.asGridCoord(10, 4)]: true, //drums
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(12, 4)]: true,
      [utils.asGridCoord(13, 4)]: true,
      [utils.asGridCoord(14, 4)]: true,
      [utils.asGridCoord(10, 5)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(12, 5)]: true,
      [utils.asGridCoord(13, 5)]: true,
      [utils.asGridCoord(14, 5)]: true,
      [utils.asGridCoord(10, 6)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(12, 6)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(14, 6)]: true, //drums end
      [utils.asGridCoord(3, 6)]: true, //bench
      [utils.asGridCoord(4, 6)]: true, //bench
      [utils.asGridCoord(2, 8)]: true, //stools
      [utils.asGridCoord(3, 8)]: true, //stools
      [utils.asGridCoord(5, 8)]: true, //stools
    },
    cutsceneSpaces: {
      [utils.asGridCoord(9, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(0, 4)]: [
        {
          events: [{ type: 'changeMap', map: 'LivingArea' }],
        },
      ],
      [utils.asGridCoord(0, 5)]: [
        {
          events: [{ type: 'changeMap', map: 'LivingArea' }],
        },
      ],
      [utils.asGridCoord(0, 6)]: [
        {
          events: [{ type: 'changeMap', map: 'LivingArea' }],
        },
      ],
    },
  },
  LivingArea: {
    lowerSrc: '/assets/maps/livingArea.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(6),
      }),
      greenSlime: new Person({
        x: utils.withGrid(15),
        y: utils.withGrid(9),
        src: '/assets/characters/greenSlime.png',
        behaviorLoop: [
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'stand', direction: 'left', time: 1400 },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'stand', direction: 'right', time: 1100 },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
        ],
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall start
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 12)]: true, //left wall end
      [utils.asGridCoord(1, -1)]: true, //top wall left start
      [utils.asGridCoord(2, -1)]: true,
      [utils.asGridCoord(3, -1)]: true,
      [utils.asGridCoord(4, -1)]: true,
      [utils.asGridCoord(5, -1)]: true,
      [utils.asGridCoord(6, -1)]: true,
      [utils.asGridCoord(7, -1)]: true,
      [utils.asGridCoord(8, -1)]: true,
      [utils.asGridCoord(9, -1)]: true,
      [utils.asGridCoord(10, -1)]: true,
      [utils.asGridCoord(11, -1)]: true,
      [utils.asGridCoord(12, -1)]: true,
      [utils.asGridCoord(13, -1)]: true,
      [utils.asGridCoord(14, -1)]: true,
      [utils.asGridCoord(15, -1)]: true,
      [utils.asGridCoord(16, -1)]: true,
      [utils.asGridCoord(17, -1)]: true,
      [utils.asGridCoord(18, -1)]: true,
      [utils.asGridCoord(19, -1)]: true,
      [utils.asGridCoord(20, -1)]: true, //top wall right end
      [utils.asGridCoord(20, 0)]: true, //right wall top start
      [utils.asGridCoord(20, 1)]: true,
      [utils.asGridCoord(20, 2)]: true,
      [utils.asGridCoord(20, 3)]: true, //right wall top end
      [utils.asGridCoord(20, 7)]: true, //right wall bottom start
      [utils.asGridCoord(20, 8)]: true,
      [utils.asGridCoord(20, 9)]: true,
      [utils.asGridCoord(20, 10)]: true,
      [utils.asGridCoord(20, 11)]: true, //right wall bottom end
      [utils.asGridCoord(20, 12)]: true, //bottom wall right end
      [utils.asGridCoord(19, 12)]: true,
      [utils.asGridCoord(18, 12)]: true,
      [utils.asGridCoord(17, 12)]: true,
      [utils.asGridCoord(16, 12)]: true,
      [utils.asGridCoord(15, 12)]: true,
      [utils.asGridCoord(14, 12)]: true,
      [utils.asGridCoord(13, 12)]: true,
      [utils.asGridCoord(12, 12)]: true, //bottom wall right start
      [utils.asGridCoord(8, 12)]: true, //bottom wall left end
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(5, 12)]: true,
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(1, 12)]: true, //bottom wall left start
      [utils.asGridCoord(1, 0)]: true, //bed area
      [utils.asGridCoord(3, 0)]: true,
      [utils.asGridCoord(4, 0)]: true,
      [utils.asGridCoord(5, 0)]: true,
      [utils.asGridCoord(6, 0)]: true,
      [utils.asGridCoord(7, 0)]: true, //bed area end
      [utils.asGridCoord(14, 3)]: true, //sofa
      [utils.asGridCoord(15, 3)]: true,
      [utils.asGridCoord(16, 3)]: true,
      [utils.asGridCoord(14, 4)]: true,
      [utils.asGridCoord(15, 4)]: true,
      [utils.asGridCoord(16, 4)]: true, //sofa end
      [utils.asGridCoord(14, 6)]: true, //tv
      [utils.asGridCoord(15, 6)]: true,
      [utils.asGridCoord(16, 6)]: true, //tv end
    },
    cutsceneSpaces: {
      [utils.asGridCoord(9, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(20, 4)]: [
        {
          events: [{ type: 'changeMap', map: 'MusicRoom' }],
        },
      ],
      [utils.asGridCoord(20, 5)]: [
        {
          events: [{ type: 'changeMap', map: 'MusicRoom' }],
        },
      ],
      [utils.asGridCoord(20, 6)]: [
        {
          events: [{ type: 'changeMap', map: 'MusicRoom' }],
        },
      ],
    },
  },
  OutsideLeft: {
    lowerSrc: '/assets/maps/outsideLeft.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(3),
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall start
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 12)]: true, //left wall end
      [utils.asGridCoord(1, -1)]: true, //top wall left start
      [utils.asGridCoord(2, -1)]: true,
      [utils.asGridCoord(3, -1)]: true,
      [utils.asGridCoord(4, -1)]: true,
      [utils.asGridCoord(5, -1)]: true,
      [utils.asGridCoord(6, -1)]: true,
      [utils.asGridCoord(7, -1)]: true,
      [utils.asGridCoord(8, -1)]: true,
      [utils.asGridCoord(8, -2)]: true, //top wall left end
      [utils.asGridCoord(12, -2)]: true, //top wall right start
      [utils.asGridCoord(12, -1)]: true,
      [utils.asGridCoord(13, -1)]: true,
      [utils.asGridCoord(14, -1)]: true,
      [utils.asGridCoord(15, -1)]: true,
      [utils.asGridCoord(16, -1)]: true,
      [utils.asGridCoord(17, -1)]: true,
      [utils.asGridCoord(18, -1)]: true,
      [utils.asGridCoord(19, -1)]: true,
      [utils.asGridCoord(20, -1)]: true, //top wall right end
      [utils.asGridCoord(20, 3)]: true, //right wall top start
      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(20, 5)]: true,
      [utils.asGridCoord(20, 6)]: true,
      [utils.asGridCoord(20, 7)]: true,
      [utils.asGridCoord(20, 8)]: true,
      [utils.asGridCoord(20, 9)]: true,
      [utils.asGridCoord(20, 10)]: true, //right wall bottom end
      [utils.asGridCoord(20, 11)]: true, //bottom wall right end
      [utils.asGridCoord(19, 11)]: true,
      [utils.asGridCoord(18, 11)]: true,
      [utils.asGridCoord(17, 11)]: true,
      [utils.asGridCoord(16, 11)]: true,
      [utils.asGridCoord(15, 11)]: true,
      [utils.asGridCoord(14, 11)]: true,
      [utils.asGridCoord(13, 11)]: true,
      [utils.asGridCoord(12, 11)]: true,
      [utils.asGridCoord(11, 11)]: true,
      [utils.asGridCoord(10, 11)]: true,
      [utils.asGridCoord(9, 11)]: true,
      [utils.asGridCoord(8, 11)]: true,
      [utils.asGridCoord(7, 11)]: true,
      [utils.asGridCoord(6, 11)]: true,
      [utils.asGridCoord(5, 11)]: true,
      [utils.asGridCoord(4, 11)]: true,
      [utils.asGridCoord(3, 11)]: true,
      [utils.asGridCoord(2, 11)]: true,
      [utils.asGridCoord(1, 11)]: true, //bottom wall left start
      [utils.asGridCoord(2, 2)]: true, //graves
      [utils.asGridCoord(3, 2)]: true,
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(2, 6)]: true,
      [utils.asGridCoord(3, 6)]: true, //graves end
      [utils.asGridCoord(9, 5)]: true, //stone
      [utils.asGridCoord(16, 4)]: true, //stone
      [utils.asGridCoord(17, 4)]: true, //stone
    },
    cutsceneSpaces: {
      [utils.asGridCoord(9, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'Office' }],
        },
      ],
      [utils.asGridCoord(20, 0)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideRight' }],
        },
      ],
      [utils.asGridCoord(20, 1)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideRight' }],
        },
      ],
      [utils.asGridCoord(20, 2)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideRight' }],
        },
      ],
    },
  },
  OutsideRight: {
    lowerSrc: '/assets/maps/outsideRight.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(3),
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall start
      [utils.asGridCoord(0, 3)]: true, //left wall proper start
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 12)]: true, //left wall end
      [utils.asGridCoord(1, -1)]: true, //top wall left start
      [utils.asGridCoord(2, -1)]: true,
      [utils.asGridCoord(3, -1)]: true,
      [utils.asGridCoord(4, -1)]: true,
      [utils.asGridCoord(5, -1)]: true,
      [utils.asGridCoord(6, -1)]: true,
      [utils.asGridCoord(7, -1)]: true,
      [utils.asGridCoord(8, -1)]: true,
      [utils.asGridCoord(8, -2)]: true, //top wall left end
      [utils.asGridCoord(12, -2)]: true, //top wall right start
      [utils.asGridCoord(12, -1)]: true,
      [utils.asGridCoord(13, -1)]: true,
      [utils.asGridCoord(14, -1)]: true,
      [utils.asGridCoord(15, -1)]: true,
      [utils.asGridCoord(16, -1)]: true,
      [utils.asGridCoord(17, -1)]: true,
      [utils.asGridCoord(18, -1)]: true,
      [utils.asGridCoord(19, -1)]: true,
      [utils.asGridCoord(20, -1)]: true, //top wall right end
      [utils.asGridCoord(20, 0)]: true, //right wall top start
      [utils.asGridCoord(20, 1)]: true,
      [utils.asGridCoord(20, 2)]: true,
      [utils.asGridCoord(20, 3)]: true,
      [utils.asGridCoord(20, 4)]: true,
      [utils.asGridCoord(20, 5)]: true,
      [utils.asGridCoord(20, 6)]: true,
      [utils.asGridCoord(20, 7)]: true,
      [utils.asGridCoord(20, 8)]: true,
      [utils.asGridCoord(20, 9)]: true,
      [utils.asGridCoord(20, 10)]: true, //right wall bottom end
      [utils.asGridCoord(20, 11)]: true, //bottom wall right end
      [utils.asGridCoord(19, 11)]: true,
      [utils.asGridCoord(18, 11)]: true,
      [utils.asGridCoord(17, 11)]: true,
      [utils.asGridCoord(16, 11)]: true,
      [utils.asGridCoord(15, 11)]: true,
      [utils.asGridCoord(14, 11)]: true,
      [utils.asGridCoord(13, 11)]: true,
      [utils.asGridCoord(12, 11)]: true,
      [utils.asGridCoord(11, 11)]: true,
      [utils.asGridCoord(10, 11)]: true,
      [utils.asGridCoord(9, 11)]: true,
      [utils.asGridCoord(8, 11)]: true,
      [utils.asGridCoord(7, 11)]: true,
      [utils.asGridCoord(6, 11)]: true,
      [utils.asGridCoord(5, 11)]: true,
      [utils.asGridCoord(4, 11)]: true,
      [utils.asGridCoord(3, 11)]: true,
      [utils.asGridCoord(2, 11)]: true,
      [utils.asGridCoord(1, 11)]: true, //bottom wall left start
      [utils.asGridCoord(3, 6)]: true, //trees
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(7, 8)]: true,
      [utils.asGridCoord(8, 7)]: true,
      [utils.asGridCoord(8, 8)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(12, 6)]: true,
      [utils.asGridCoord(12, 7)]: true,
      [utils.asGridCoord(12, 8)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 7)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(16, 4)]: true,
      [utils.asGridCoord(16, 5)]: true,
      [utils.asGridCoord(16, 6)]: true,
      [utils.asGridCoord(16, 7)]: true,
      [utils.asGridCoord(17, 4)]: true,
      [utils.asGridCoord(17, 5)]: true,
      [utils.asGridCoord(17, 6)]: true,
      [utils.asGridCoord(17, 7)]: true,
      [utils.asGridCoord(18, 4)]: true,
      [utils.asGridCoord(18, 5)]: true,
      [utils.asGridCoord(18, 6)]: true,
      [utils.asGridCoord(18, 7)]: true, //trees end
      [utils.asGridCoord(6, 5)]: true, //log
      [utils.asGridCoord(7, 5)]: true, //log
    },
    cutsceneSpaces: {
      [utils.asGridCoord(9, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [{ type: 'changeMap', map: 'GamesRoom' }],
        },
      ],
      [utils.asGridCoord(0, 0)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideLeft' }],
        },
      ],
      [utils.asGridCoord(0, 1)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideLeft' }],
        },
      ],
      [utils.asGridCoord(0, 2)]: [
        {
          events: [{ type: 'changeMap', map: 'OutsideLeft' }],
        },
      ],
    },
  },
};

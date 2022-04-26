class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
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
      const relevantScenario = match.clickAction.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });
      relevantScenario && this.startCutscene(relevantScenario.events);
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
    id: 'Office',
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
                text: 'Well done for making it this far! You\'re an actual genius. Have a wander and hit "ENTER" when looking at stuff and you might see some of Kev\'s various projects or hit "ENTER" when looking at someone to chat... Everyone has something to say!',
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
                text: "Apart from checking out Kev's projects, keep your eyes peeled for missing vinyl from his record collection, they will come in handy in battles. You already have a few in your inventory, but they might not be the best records Kev owns...",
              },
              {
                type: 'textMessage',
                text: 'Massive thanks to Drew Conley (check out his YouTube channel) for your help and for creating the video series which is the foundation of this site and also to the Game Dev Shift Discord group for all your help too',
              },
              {
                type: 'textMessage',
                text: "Finally a word of warning... Don't go thru the south door of the office or games room, lest ye will perish!....... My advice would be to go speak to Kev's Mum first. She's the other person in this room. Happy exploring!",
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
      mumPainting: new Painting({
        x: utils.withGrid(3),
        y: utils.withGrid(-1),
        src: '/assets/paintings/mum.png',
        imgSrc: 'https://picsum.photos/200/300',
      }),
      ncPainting: new Painting({
        x: utils.withGrid(5),
        y: utils.withGrid(-1),
        src: '/assets/paintings/nc.png',
        imgSrc: 'https://picsum.photos/300/200',
      }),
      mum: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(1),
        src: '/assets/characters/mum.png',
        clickAction: [
          {
            required: ['TALKED_TO_MUM_FIVE'],
            events: [
              {
                type: 'textMessage',
                text: 'Did you manage to chat to Jim yet? Hes Kevs oldest friend and should be able to help you',
                faceHero: 'mum',
              },
            ],
          },
          {
            required: ['DEFEATED_MUM'],
            events: [
              {
                type: 'textMessage',
                text: 'Well I hope you feel proud of yourself, picking on a septuagenarian and I hope you like that vinyl of mine. Now your collection is getting strong, I would go have a word with Jim in the games room East of here. His music taste is definitely different to mine!',
                faceHero: 'mum',
              },
              { type: 'addStoryFlag', flag: 'TALKED_TO_MUM_FIVE' },
            ],
          },
          {
            required: ['TALKED_TO_MUM_FOUR'],
            events: [
              {
                type: 'textMessage',
                text: "I hope you got that new vinyl sorted! It's time for me to teach you some more lessons young one",
                faceHero: 'mum',
              },
              { type: 'battle', enemyId: 'mum' },
            ],
          },
          {
            required: ['TALKED_TO_MUM_THRICE'],
            events: [
              {
                type: 'textMessage',
                text: 'You seem to have been beaten by a retired great-grandma! Maybe you need an extra vinyl in your lineup. Go check out that vinyl press in the top left corner of this room then come back and see if you can challenge me',
                faceHero: 'mum',
              },
              { type: 'addStoryFlag', flag: 'TALKED_TO_MUM_FOUR' },
            ],
          },
          {
            required: ['TALKED_TO_MUM_TWICE', 'DEFEATED_STEVE'],
            events: [
              {
                type: 'textMessage',
                text: 'Ooh well done! You have beaten our slimy friend. Beating opponent vinyls will power up your own collection and if you defeat an opponent, they may even give you one of their vinyls. Now see if you can take on someone with better music taste',
                faceHero: 'mum',
              },
              { type: 'battle', enemyId: 'mum' },
              { type: 'addStoryFlag', flag: 'TALKED_TO_MUM_THRICE' },
            ],
          },
          {
            required: ['TALKED_TO_MUM'],
            events: [
              {
                type: 'textMessage',
                text: "See! Mum always knows best. This sequence of messages however will repeat in an annoying loop, at least until another game condition is met. That's kind of how RPGs work... Hint: Try talking to the slime and I might have something else to say",
                faceHero: 'mum',
              },
              {
                type: 'textMessage',
                text: 'In the top left of the screen is your HUD, which features your active battle-vinyl. You can change this in the pause menu',
                faceHero: 'mum',
              },
              { type: 'addStoryFlag', flag: 'TALKED_TO_MUM_TWICE' },
            ],
          },
          {
            events: [
              {
                type: 'textMessage',
                text: "Oh hi! I'm Kev's Mum. Can I get you a cup of tea?...",
                faceHero: 'mum',
              },
              {
                type: 'textMessage',
                text: "You can talk to characters in this game. They might help you out or they might even want a battle. In this game we fight with our record collections. All of the music in this game is part of Kev's eclectic music collection",
                faceHero: 'mum',
              },
              {
                type: 'textMessage',
                text: "It's worth talking to people several times as their speech may change based on events. Take me, for example: I won't repeat this bit of speech unless you restart the game. Try it out! Talk to me again...",
                faceHero: 'mum',
              },
              { type: 'addStoryFlag', flag: 'TALKED_TO_MUM' },
            ],
          },
        ],
      }),
      slime: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(9),
        src: '/assets/characters/slime.png',
        behaviorLoop: [
          // { type: 'walk', direction: 'left' },
          // { type: 'walk', direction: 'left' },
          // { type: 'walk', direction: 'left' },
          // { type: 'walk', direction: 'left' },
          // { type: 'walk', direction: 'left' },
          // { type: 'stand', direction: 'left', time: 1400 },
          // { type: 'walk', direction: 'right' },
          // { type: 'walk', direction: 'right' },
          // { type: 'walk', direction: 'right' },
          // { type: 'walk', direction: 'right' },
          // { type: 'walk', direction: 'right' },
          // { type: 'walk', direction: 'right' },
          // { type: 'walk', direction: 'right' },
          // { type: 'stand', direction: 'right', time: 1100 },
          // { type: 'walk', direction: 'left' },
          // { type: 'walk', direction: 'left' },
        ],
        clickAction: [
          {
            required: ['TALKED_TO_MUM', 'DEFEATED_STEVE'],
            events: [
              {
                type: 'textMessage',
                text: "You've met Kev's mum? Her real name is actually Pamela. There's a picture of her non-avatar version somewhere in this room",
                faceHero: 'slime',
              },
            ],
          },
          {
            required: ['DEFEATED_STEVE'],
            events: [
              {
                type: 'textMessage',
                text: 'No way am I fighting you again! Your vinyl collection is strong like the ox',
                faceHero: 'slime',
              },
            ],
          },
          {
            events: [
              {
                type: 'textMessage',
                text: 'Hey! Did you know that if you select one of your records in the pause menu, you can swap it out for another or make it the first combatant',
                faceHero: 'slime',
              },
              {
                type: 'textMessage',
                text: 'You can practice fighting against me, [puffs up their chest] I am like the slime Ali...',
                faceHero: 'slime',
              },
              { type: 'battle', enemyId: 'steve' },
              {
                type: 'textMessage',
                text: 'If you would have let me finish, I was saying I am like the slime Alistair McGowan. Great at impersonations, rubbish at vinyl wars',
                faceHero: 'slime',
              },
              {
                type: 'textMessage',
                text: "Here you go, you can have my vinyl. I'm rubbish at this game anyway. If you beat people in this game, they will normally give you one of their precious battle-vinyls",
                faceHero: 'slime',
              },
            ],
          },
        ],
      }),
      recordPress: new RecordPress({
        x: utils.withGrid(1),
        y: utils.withGrid(0),
        storyFlag: 'USED_RECORD_PRESS',
        records: ['t001', 'r001'],
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
      [utils.asGridCoord(9, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(10, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(11, -3)]: true, //invisible exit barrier
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
      [utils.asGridCoord(21, 4)]: true, //invisible exit barrier
      [utils.asGridCoord(21, 5)]: true, //invisible exit barrier
      [utils.asGridCoord(21, 6)]: true, //invisible exit barrier
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
      [utils.asGridCoord(11, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(10, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(9, 13)]: true, //invisible exit barrier
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
            { who: 'mum', type: 'walk', direction: 'right' },
            { who: 'mum', type: 'walk', direction: 'right' },
            { who: 'mum', type: 'walk', direction: 'right' },
            { who: 'mum', type: 'walk', direction: 'right' },
            { who: 'mum', type: 'walk', direction: 'right' },
            { who: 'mum', type: 'walk', direction: 'right' },
            { who: 'mum', type: 'walk', direction: 'right' },
            { who: 'mum', type: 'walk', direction: 'right' },
            {
              type: 'textMessage',
              text: "Kev's mum is disappointed you are going to the static site. She suggests that by skipping the game, you may be missing the best project...",
            },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'walk', direction: 'left' },
            { who: 'mum', type: 'stand', direction: 'right' },
          ],
        },
      ],
      [utils.asGridCoord(9, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'LivingArea',
              x: utils.withGrid(9),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'LivingArea',
              x: utils.withGrid(10),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'LivingArea',
              x: utils.withGrid(11),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 4)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(0),
              y: utils.withGrid(4),
              direction: 'right',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 5)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(0),
              y: utils.withGrid(5),
              direction: 'right',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 6)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(0),
              y: utils.withGrid(6),
              direction: 'right',
            },
          ],
        },
      ],
      [utils.asGridCoord(9, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideLeft',
              x: utils.withGrid(9),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideLeft',
              x: utils.withGrid(10),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideLeft',
              x: utils.withGrid(11),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
    },
  },
  GamesRoom: {
    id: 'GamesRoom',
    lowerSrc: '/assets/maps/gamesRoom.png',
    upperSrc: '/assets/maps/gamesRoomUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        // x: utils.withGrid(6),
        // y: utils.withGrid(4),
      }),
      jim: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(5),
        src: '/assets/characters/jim.png',
        behaviorLoop: [
          { type: 'stand', direction: 'right', time: 4000 },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'stand', direction: 'up', time: 4400 },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
        ],
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: 'Easy blood! Got time for a few frames?',
                faceHero: 'jim',
              },
            ],
          },
        ],
      }),
      jimPainting: new Painting({
        x: utils.withGrid(4),
        y: utils.withGrid(-1),
        src: '/assets/paintings/jimPicture.png',
        imgSrc: 'https://picsum.photos/300/200',
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall top start
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true, //left wall top end
      [utils.asGridCoord(-1, 4)]: true, //invisible exit barrier
      [utils.asGridCoord(-1, 5)]: true, //invisible exit barrier
      [utils.asGridCoord(-1, 6)]: true, //invisible exit barrier
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
      [utils.asGridCoord(8, -2)]: true,
      [utils.asGridCoord(9, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(10, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(11, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(12, -2)]: true,
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
      [utils.asGridCoord(11, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(10, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(9, 13)]: true, //invisible exit barrier
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
          events: [
            {
              type: 'changeMap',
              map: 'MusicRoom',
              x: utils.withGrid(9),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'MusicRoom',
              x: utils.withGrid(10),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'MusicRoom',
              x: utils.withGrid(11),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 4)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(20),
              y: utils.withGrid(4),
              direction: 'left',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 5)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(20),
              y: utils.withGrid(5),
              direction: 'left',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 6)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(20),
              y: utils.withGrid(6),
              direction: 'left',
            },
          ],
        },
      ],
      [utils.asGridCoord(9, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideRight',
              x: utils.withGrid(9),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideRight',
              x: utils.withGrid(10),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideRight',
              x: utils.withGrid(11),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
    },
  },
  MusicRoom: {
    id: 'MusicRoom',
    lowerSrc: '/assets/maps/musicRoom.png',
    upperSrc: '/assets/maps/gamesRoomUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        // x: utils.withGrid(4),
        // y: utils.withGrid(3),
      }),
      kev: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(1),
        src: '/assets/characters/kev.png',
        behaviorLoop: [
          { type: 'stand', direction: 'up', time: 2700 },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'stand', direction: 'right', time: 5300 },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'up' },
        ],
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: "Can't you see we're busy? Rob and I are working on a new kind of music made entirely from the sound of crushed dreams and bitterness",
                faceHero: 'kev',
              },
            ],
          },
        ],
      }),
      rob: new Person({
        x: utils.withGrid(16),
        y: utils.withGrid(1),
        src: '/assets/characters/rob.png',
        behaviorLoop: [
          { type: 'stand', direction: 'up', time: 3000 },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'stand', direction: 'left', time: 5000 },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'up' },
        ],
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: "Have you met Kev before? Oh well I don't need to tell you to ignore everything he says then!",
                faceHero: 'rob',
              },
            ],
          },
        ],
      }),
      robPainting: new Painting({
        x: utils.withGrid(10),
        y: utils.withGrid(-1),
        src: '/assets/paintings/robPicture.png',
        imgSrc: 'https://picsum.photos/300/200',
      }),
      kevPainting: new Painting({
        x: utils.withGrid(12),
        y: utils.withGrid(-1),
        src: '/assets/paintings/kevPicture.png',
        imgSrc: 'https://picsum.photos/300/200',
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall top start
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true, //left wall top end
      [utils.asGridCoord(-1, 4)]: true, //invisible exit barrier
      [utils.asGridCoord(-1, 5)]: true, //invisible exit barrier
      [utils.asGridCoord(-1, 6)]: true, //invisible exit barrier
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
      [utils.asGridCoord(11, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(10, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(9, 13)]: true, //invisible exit barrier
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
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(9),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(10),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(11),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 4)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'LivingArea',
              x: utils.withGrid(20),
              y: utils.withGrid(4),
              direction: 'left',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 5)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'LivingArea',
              x: utils.withGrid(20),
              y: utils.withGrid(5),
              direction: 'left',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 6)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'LivingArea',
              x: utils.withGrid(20),
              y: utils.withGrid(6),
              direction: 'left',
            },
          ],
        },
      ],
    },
  },
  LivingArea: {
    id: 'LivingArea',
    lowerSrc: '/assets/maps/livingArea.png',
    upperSrc: '/assets/maps/officeUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        // x: utils.withGrid(10),
        // y: utils.withGrid(6),
      }),
      isla: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(3),
        src: '/assets/characters/isla.png',
        behaviorLoop: [
          { type: 'stand', direction: 'right', time: 7000 },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'stand', direction: 'up', time: 3000 },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
        ],
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: 'Hi! Are you looking for Kevvy? It sounds like he is practicing in the music room with Rob',
                faceHero: 'isla',
              },
            ],
          },
        ],
      }),
      alys: new Person({
        x: utils.withGrid(15),
        y: utils.withGrid(9),
        src: '/assets/characters/alys.png',
        behaviorLoop: [
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
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
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: 'Raaaaaaarrrghhh [Alys stares at you for a few seconds frowning, then pulls a silly face and laughs]',
                faceHero: 'alys',
              },
            ],
          },
        ],
      }),
      alysPainting: new Painting({
        x: utils.withGrid(13),
        y: utils.withGrid(-1),
        src: '/assets/paintings/alysPicture.png',
        imgSrc: 'https://picsum.photos/300/250',
      }),
      islaPainting: new Painting({
        x: utils.withGrid(15),
        y: utils.withGrid(-1),
        src: '/assets/paintings/islaPicture.png',
        imgSrc: 'https://picsum.photos/300/250',
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
      [utils.asGridCoord(21, 4)]: true, //invisible exit barrier
      [utils.asGridCoord(21, 5)]: true, //invisible exit barrier
      [utils.asGridCoord(21, 6)]: true, //invisible exit barrier
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
      [utils.asGridCoord(11, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(10, 13)]: true, //invisible exit barrier
      [utils.asGridCoord(9, 13)]: true, //invisible exit barrier
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
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(9),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(10),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(11),
              y: utils.withGrid(-2),
              direction: 'down',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 4)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'MusicRoom',
              x: utils.withGrid(0),
              y: utils.withGrid(4),
              direction: 'right',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 5)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'MusicRoom',
              x: utils.withGrid(0),
              y: utils.withGrid(5),
              direction: 'right',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 6)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'MusicRoom',
              x: utils.withGrid(0),
              y: utils.withGrid(6),
              direction: 'right',
            },
          ],
        },
      ],
    },
  },
  OutsideLeft: {
    id: 'OutsideLeft',
    lowerSrc: '/assets/maps/outsideLeft.png',
    upperSrc: '/assets/characters/blankSquare.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        // x: utils.withGrid(10),
        // y: utils.withGrid(3),
      }),
      skeleton: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(2),
        src: '/assets/characters/skeleton.png',
        behaviorLoop: [
          { type: 'stand', direction: 'right', time: 4000 },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'walk', direction: 'right' },
          { type: 'stand', direction: 'down', time: 3000 },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'walk', direction: 'down' },
          { type: 'stand', direction: 'left', time: 5000 },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'walk', direction: 'left' },
          { type: 'stand', direction: 'up', time: 4400 },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
          { type: 'walk', direction: 'up' },
        ],
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: "You can practice fighting against me if you like, I'm tougher than I look",
                faceHero: 'skeleton',
              },
              // { type: 'battle', enemyId: 'mum' },
            ],
          },
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
      [utils.asGridCoord(9, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(10, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(11, -3)]: true, //invisible exit barrier
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
      [utils.asGridCoord(21, 0)]: true, //invisible exit barrier
      [utils.asGridCoord(21, 1)]: true, //invisible exit barrier
      [utils.asGridCoord(21, 2)]: true, //invisible exit barrier
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
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(9),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(10),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Office',
              x: utils.withGrid(11),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 0)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideRight',
              x: utils.withGrid(0),
              y: utils.withGrid(0),
              direction: 'right',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 1)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideRight',
              x: utils.withGrid(0),
              y: utils.withGrid(1),
              direction: 'right',
            },
          ],
        },
      ],
      [utils.asGridCoord(20, 2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideRight',
              x: utils.withGrid(0),
              y: utils.withGrid(2),
              direction: 'right',
            },
          ],
        },
      ],
    },
  },
  OutsideRight: {
    id: 'OutsideRight',
    lowerSrc: '/assets/maps/outsideRight.png',
    upperSrc: '/assets/characters/blankSquare.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        // x: utils.withGrid(10),
        // y: utils.withGrid(3),
      }),
    },
    walls: {
      [utils.asGridCoord(0, -1)]: true, //left wall start
      [utils.asGridCoord(-1, 0)]: true, //invisible exit barrier
      [utils.asGridCoord(-1, 1)]: true, //invisible exit barrier
      [utils.asGridCoord(-1, 2)]: true, //invisible exit barrier
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
      [utils.asGridCoord(9, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(10, -3)]: true, //invisible exit barrier
      [utils.asGridCoord(11, -3)]: true, //invisible exit barrier
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
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(9),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(10, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(10),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(11, -2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'GamesRoom',
              x: utils.withGrid(11),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 0)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideLeft',
              x: utils.withGrid(20),
              y: utils.withGrid(0),
              direction: 'left',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 1)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideLeft',
              x: utils.withGrid(20),
              y: utils.withGrid(1),
              direction: 'left',
            },
          ],
        },
      ],
      [utils.asGridCoord(0, 2)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'OutsideLeft',
              x: utils.withGrid(20),
              y: utils.withGrid(2),
              direction: 'left',
            },
          ],
        },
      ],
    },
  },
};

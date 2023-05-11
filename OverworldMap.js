class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = {}; //Live content
    this.configObjects = config.configObjects; //Config content

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
    Object.keys(this.configObjects).forEach((key) => {
      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type === 'Person') {
        instance = new Person(object);
      }
      if (object.type === 'GameObject') {
        instance = new GameObject(object);
      }
      if (object.type === 'VideoDisplay') {
        instance = new VideoDisplay(object);
      }
      if (object.type === 'Painting') {
        instance = new Painting(object);
      }
      if (object.type === 'EmbedDisplay') {
        instance = new EmbedDisplay(object);
      }
      if (object.type === 'RecordPress') {
        instance = new RecordPress(object);
      }
      if (object.type === 'BoomBox') {
        instance = new BoomBox(object);
      }
      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;
      instance.mount(this);
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
    // Object.values(this.gameObjects).forEach((object) =>
    //   object.doBehaviorEvent(this)
    // );
    // The next 10 lines have replaced the above 3... Pending testing

    //Restart idle behaviors after cutscene is over
    Object.values(this.gameObjects).forEach((object) => {
      const current = object.behaviorLoop[object.behaviorLoopIndex];
      //Reset NPCs to do their idle behavior (if they are standing)
      if (current && current.type === 'stand') {
        object.doBehaviorEvent(this);
      }
      //Reset NPCs to do their walking behavior (if they are still and waiting)
      if (
        current &&
        current.type === 'walk' &&
        object.movingProgressRemaining === 0
      ) {
        object.doBehaviorEvent(this);
      }
    });
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
}

window.OverworldMaps = {
  Office: {
    id: 'Office',
    lowerSrc: '/assets/maps/office.png',
    upperSrc: '/assets/maps/officeUpper.png',
    configObjects: {
      hero: {
        type: 'Person',
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(2),
      },
      bookcaseLeft: {
        type: 'GameObject',
        x: utils.withGrid(14),
        y: utils.withGrid(-1),
        src: '/assets/characters/blankSquare.png',
        clickAction: [
          {
            events: [
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/NCpromo.png',
                description: 'Northcoders promotional image',
                text: "Career 2021 to Present </br></br> Northcoders - Software engineer and seminar lead </br></br> Having made the decision to retrain as a software developer during the Covid pandemic, Kev sought out the best full stack boot camp to springboard his career </br></br> Upon the recommendation of many he discovered Northcoders and hasn't looked back since! </br></br> After completing the Northcoders course, Kev landed his dream job working for them in September 2021 as a Junior software engineer and mentor </br></br> In June 2022 the whirlwind journey continued when Kev was promoted to Software engineer and seminar lead </br></br> <a target='_blank' class='magenta' href='https://northcoders.com'>Northcoders website</a>",
              },
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/dynamic.png',
                description: 'Dynamic music tutors logo',
                text: "Career 2016 to 2020 </br></br> Dynamic music tutors - Owner/peripatetic music teacher </br></br> Responsible for the entire music curriculum for two primary schools, Kev taught from reception all the way up to year 6. Lessons included: Traditional classroom, large percussion groups, small SEND groups and small specialist instrumental groups </br></br> He was responsible for organizing annual events including the schools' summer concerts </br></br> Kev also taught peripatetic music tuition in high school and helped many young aspiring musicians achieve music grades </br></br> <a target='_blank' class='magenta' href='https://www.facebook.com/dynamicmusictutors'>Dynamic Music Tutors - Facebook</a>",
              },
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/DFR.png',
                description: 'Dynamic music tutors logo',
                text: "Career 2012 to 2020 </br></br> Dogface Records - Joint founder </br></br> Officially launched in 2014, Dogface Records was a passion project from a 5 strong team of musicians/producers including Kev </br></br> In-house producer for the team, he produced several albums and eps for up and coming acts around Manchester </br></br> Kev and the Dogface team organized many successful European tours for their acts, building up a network in Europe from scratch </br></br> In the later years he worked a residency with DFR partner Robert John in the Northern Quarter of Manchester for 3 years and performed many times for MIHC in hospitals and care homes </br></br> <a target='_blank' class='magenta' href='https://www.dogfacerecords.co.uk'>Dogface Records Website</a>",
              },
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/kevAndIsla.png',
                description: 'Kev and Isla on a cold and windy day',
                text: "</br></br></br></br></br></br> Contact: </br></br></br></br><a target='_blank' class='magenta' href='https://www.linkedin.com/in/kev-morel'>Contact Kev Via Linkdin</a></br></br></br></br><a target='_blank' class='magenta' href='https://github.com/sirKevlar'>Check out Kev's Github</a> </br></br></br></br> Or email kpmorel@gmail.com",
              },
            ],
          },
        ],
      },
      bookcaseRight: {
        type: 'GameObject',
        x: utils.withGrid(18),
        y: utils.withGrid(-1),
        src: '/assets/characters/blankSquare.png',
        clickAction: [
          {
            events: [
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/earlyCareer.png',
                description: 'company logos',
                text: 'Early career: </br></br></br> 2012 to 2016 One education - Peripatetic music tutor </br></br></br> 2009 to 2012 Couture Cafe - Cafe Supervisor/Chef </br></br></br> 2005 to 2009 James Barber Decorators - Painter and decorator </br></br></br> 2002 to 2005 Window Options - Head of roofing fabrication </br></br></br> 2001 to 2002 Printers Direct - Sales broker </br></br></br> 1999 to 2001 Genesis V Systems - Administrator',
              },
            ],
          },
        ],
      },
      coffeeTableNote: {
        type: 'GameObject',
        x: utils.withGrid(16),
        y: utils.withGrid(8),
        src: '/assets/characters/blankSquare.png',
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: 'Well done for making it this far! You\'re an actual genius. Have a wander and hit "ENTER" when looking at paintings, computers, bookshelves, items on tables and other stuff and you might see some of Kev\'s various projects',
              },
              {
                type: 'textMessage',
                text: 'Or hit "ENTER" when looking at someone to chat... Everyone has something to say!',
              },
              {
                type: 'textMessage',
                text: "This house has 4 rooms: The office (this room) - Features React projects  and other office-y things... For example: if you face the bookshelves in this room and hit enter, you can check out Kev's work history and get contact details",
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
                text: "Massive thanks to Drew Conley (check out his YouTube channel) for your help and for creating the video series which the foundations of this site's game engine and also to the Game Dev Shift Discord group for all your help too",
              },
              {
                type: 'textMessage',
                text: "Finally a word of warning... Don't go thru the south door of the office or games room, lest ye will perish!....... My advice would be to go speak to Kev's Mum first. She's the other person in this room. Happy exploring!",
              },
            ],
          },
        ],
      },
      deskLaptop: {
        type: 'GameObject',
        x: utils.withGrid(16),
        y: utils.withGrid(0),
        src: '/assets/characters/blankSquare.png',
        clickAction: [
          {
            events: [
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/kevHair.png',
                description: 'Great hair pic',
                text: "</br></br></br></br></br></br></br></br></br></br></br></br><a target='_blank' class='magenta' href='https://www.kevmorelportfolio.com/'>Boring static website...</a>",
              },
            ],
          },
        ],
      },
      conferenceTableLaptopRight: {
        type: 'VideoDisplay',
        x: utils.withGrid(4),
        y: utils.withGrid(2),
        src: '/assets/characters/blankSquare.png',
        videos: [
          'https://www.youtube.com/embed/AW9Ncs6C_Es',
          'https://www.youtube.com/embed/1lGdSrrptkI',
          'https://www.youtube.com/embed/hmOmKOoF9PU',
        ],
        descriptions: [
          'Lightning talk - web audio api',
          'Northcoders graduation project',
          'Lightning talk - inspirational women in tech',
        ],
      },
      conferenceTableLaptopLeft: {
        type: 'VideoDisplay',
        x: utils.withGrid(3),
        y: utils.withGrid(2),
        src: '/assets/characters/blankSquare.png',
        videos: [
          'https://www.youtube.com/embed/AW9Ncs6C_Es',
          'https://www.youtube.com/embed/1lGdSrrptkI',
          'https://www.youtube.com/embed/hmOmKOoF9PU',
        ],
        descriptions: [
          'Lightning talk - web audio api',
          'Northcoders graduation project',
          'Lightning talk - inspirational women in tech',
        ],
      },
      mumPainting: {
        type: 'Painting',
        x: utils.withGrid(3),
        y: utils.withGrid(-1),
        description: "Pictures of Pamela (Kev's Mum)",
        src: '/assets/paintings/mum.png',
        imgSrc: ['/assets/pictures/mum.jpeg'],
      },
      ncPainting: {
        type: 'EmbedDisplay',
        x: utils.withGrid(5),
        y: utils.withGrid(-1),
        description:
          'Northcoders project using React, Express, PostgreSQL - Login: jessjelly',
        src: '/assets/paintings/nc.png',
        embedSrc: 'https://kev-morel-react-game-reviews.netlify.app',
      },
      mum: {
        type: 'Person',
        x: utils.withGrid(7),
        y: utils.withGrid(1),
        src: '/assets/characters/mum.png',
        clickAction: [
          {
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Yep you've completed this game. I know it was quick, but it was just a cheap way to get you to look at Kev's work anyway. I hope you enjoyed it",
                faceHero: 'mum',
              },
            ],
          },
          {
            required: ['TALKED_TO_JIM_TWICE'],
            events: [
              {
                type: 'textMessage',
                text: "Oh you've met Jim then? Such a lovely young man! He has been Kev's friend for 23 years. Have you met Kev's daughters yet? They're in the room north of here and they are called Isla and Alys",
                faceHero: 'mum',
              },
              { type: 'addStoryFlag', flag: 'TALKED_TO_MUM_SIX' },
            ],
          },
          {
            required: ['TALKED_TO_MUM_FIVE'],
            events: [
              {
                type: 'textMessage',
                text: "Did you manage to chat to Jim yet? He's Kev's oldest friend and should be able to help you",
                faceHero: 'mum',
              },
            ],
          },
          {
            required: ['DEFEATED_MUM'],
            events: [
              {
                type: 'textMessage',
                text: 'Well I hope you feel proud of yourself, picking on a septuagenarian and I hope you like that vinyl of mine. Now your collection is getting strong, I would go have a word with Jim in the games room East of here',
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
            required: ['TALKED_TO_MUM_TWICE', 'DEFEATED_SLIMY'],
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
      },
      slime: {
        type: 'Person',
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
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Yep you've completed this game. I know it was quick, but it was just a cheap way to get you to look at Kev's work anyway. I hope you enjoyed it",
                faceHero: 'slime',
              },
            ],
          },
          {
            required: ['TALKED_TO_MUM', 'DEFEATED_SLIMY'],
            events: [
              {
                type: 'textMessage',
                text: "You've met Kev's mum? Her real name is actually Pamela. There's a picture of her non-avatar version somewhere in this room",
                faceHero: 'slime',
              },
            ],
          },
          {
            required: ['DEFEATED_SLIMY'],
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
              { type: 'battle', enemyId: 'slime' },
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
      },
      recordPress: {
        type: 'RecordPress',
        x: utils.withGrid(1),
        y: utils.withGrid(0),
        storyFlag: 'USED_RECORD_PRESS',
        records: ['t001', 'r001'],
      },
      calculator: {
        type: 'EmbedDisplay',
        x: utils.withGrid(3),
        y: utils.withGrid(7),
        description: 'calculator (mini react app)',
        src: '/assets/objects/calculator.png',
        embedSrc: 'https://kev-morel-react-calculator.netlify.app',
      },
      colorSample: {
        type: 'EmbedDisplay',
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        description: 'color schemes (mini react app)',
        src: '/assets/objects/colors.png',
        embedSrc: 'https://kev-morel-color-schemes.netlify.app',
      },
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
    configObjects: {
      hero: {
        type: 'Person',
        isPlayerControlled: true,
        // x: utils.withGrid(6),
        // y: utils.withGrid(4),
      },
      jim: {
        type: 'Person',
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
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Yep you've completed this game. I know it was quick, but it was just a cheap way to get you to look at Kev's work anyway. I hope you enjoyed it",
                faceHero: 'jim',
              },
              { type: 'repairVinyl' },
            ],
          },
          {
            required: ['TALKED_TO_JIM_SEVEN'],
            events: [
              {
                type: 'textMessage',
                text: "What are you waiting for? I have heard that if anyone can actually beat that skeleton that they will get a discount code for Kev's album...",
                faceHero: 'jim',
              },
            ],
          },
          {
            required: ['DEFEATED_KEV'],
            events: [
              {
                type: 'textMessage',
                text: 'Feels good beating Kev eh? I should know pal, we have been playing snooker against each other for over 30 years and I have actually won 99% of those matches. Go and beat that evil skeleton in the garden and free us all',
                faceHero: 'jim',
              },
              { type: 'repairVinyl' },
              { type: 'addStoryFlag', flag: 'TALKED_TO_JIM_SEVEN' },
            ],
          },
          {
            required: ['TALKED_TO_JIM_SIX'],
            events: [
              {
                type: 'textMessage',
                text: 'Nows you time to shine pal. Get in there, give it some and pull Kev down a peg or two',
                faceHero: 'jim',
              },
            ],
          },
          {
            required: ['DEFEATED_ROB'],
            events: [
              {
                type: 'textMessage',
                text: "Rob has a sick collection blood, but Kev's is as eclectic as it gets. Now let me fix those vinyl up",
                faceHero: 'jim',
              },
              { type: 'repairVinyl' },
              { type: 'addStoryFlag', flag: 'TALKED_TO_JIM_SIX' },
            ],
          },
          {
            required: ['TALKED_TO_JIM_FIVE'],
            events: [
              {
                type: 'textMessage',
                text: 'Time to go battle in the music room pal',
                faceHero: 'jim',
              },
            ],
          },
          {
            required: ['DEFEATED_ALYS'],
            events: [
              {
                type: 'textMessage',
                text: "Wow. I don't know many who have survived battling big Al! Respect fam! You earned some vinyl repairs",
                faceHero: 'jim',
              },
              { type: 'repairVinyl' },
              { type: 'addStoryFlag', flag: 'TALKED_TO_JIM_FIVE' },
            ],
          },
          {
            required: ['TALKED_TO_JIM_FOUR'],
            events: [
              {
                type: 'textMessage',
                text: "You're going to have to beat Alys if you wanna battle with Kev pal",
                faceHero: 'jim',
              },
            ],
          },
          {
            required: ['DEFEATED_ISLA'],
            events: [
              {
                type: 'textMessage',
                text: "You beat Isla already? Maybe Kev needs to make this game more difficult! I don't expect to see you back here after taking Alys on... Good luck, you'll need it",
                faceHero: 'jim',
              },
              { type: 'repairVinyl' },
              { type: 'addStoryFlag', flag: 'TALKED_TO_JIM_FOUR' },
            ],
          },
          {
            required: ['TALKED_TO_JIM_THRICE'],
            events: [
              {
                type: 'textMessage',
                text: 'Have you spoken to Isla and Alys yet? I think they may be up for a battle',
                faceHero: 'jim',
              },
            ],
          },
          {
            required: ['DEFEATED_JIM'],
            events: [
              {
                type: 'textMessage',
                text: "You must be northern yourself pal. Your funk chin is powerful! Enjoy that vinyl of mine and before you ask, yeah I will mend your current lineup. I would go and talk to Kev's kids next, well if you want the story to continue anyway...",
                faceHero: 'jim',
              },
              { type: 'repairVinyl' },
              { type: 'addStoryFlag', flag: 'TALKED_TO_JIM_THRICE' },
            ],
          },
          {
            required: ['TALKED_TO_JIM_TWICE'],
            events: [
              {
                type: 'textMessage',
                text: "Let's see how your collection stands up against mine pal. Prepare to face off against some of the greatest techno and hip hop in history",
                faceHero: 'jim',
              },
              { type: 'battle', enemyId: 'jim' },
            ],
          },
          {
            required: ['TALKED_TO_JIM', 'DEFEATED_MUM'],
            events: [
              {
                type: 'textMessage',
                text: "Oh wow! You met Pamela then? She made a right mess of your vinyl in that dust up pal. I would love to take you on and teach you how to 'see the beats' as I can, but the battle wouldn't really be fair right now",
                faceHero: 'jim',
              },
              {
                type: 'textMessage',
                text: "I can repair your damaged vinyl though pal. If you wanna battle Kev, you're gonna need all the help you can get!",
                faceHero: 'jim',
              },
              { type: 'repairVinyl' },
              {
                type: 'textMessage',
                text: "You can come see me again when you defeat someone and if I'm not too busy, I might fix your vinyl up. Let me know if you fancy a battle, I think you might be ready...",
                faceHero: 'jim',
              },
              { type: 'addStoryFlag', flag: 'TALKED_TO_JIM_TWICE' },
            ],
          },
          {
            events: [
              {
                type: 'textMessage',
                text: 'Easy blood! Got time for a few frames?',
                faceHero: 'jim',
              },
              { type: 'addStoryFlag', flag: 'TALKED_TO_JIM' },
            ],
          },
        ],
      },
      jimPainting: {
        type: 'Painting',
        x: utils.withGrid(4),
        y: utils.withGrid(-1),
        description:
          "pictures of Jim (Kev's oldest friend and snooker/pool opponent)",
        src: '/assets/paintings/jimPicture.png',
        imgSrc: [
          '/assets/pictures/jim.jpeg',
          '/assets/pictures/jim2.jpeg',
          '/assets/pictures/jim3.jpeg',
        ],
      },
      arcadeOneLeft: {
        type: 'EmbedDisplay',
        x: utils.withGrid(1),
        y: utils.withGrid(0),
        description: 'memory matcher game built with vanilla html css js',
        src: '/assets/characters/blankSquare.png',
        embedSrc:
          'https://agitated-yonath-d2d0d6.netlify.app/memory-matching-game/memory-matcher.html',
      },
      arcadeOneRight: {
        type: 'EmbedDisplay',
        x: utils.withGrid(2),
        y: utils.withGrid(0),
        description: 'memory matcher game built with vanilla html css js',
        src: '/assets/characters/blankSquare.png',
        embedSrc:
          'https://agitated-yonath-d2d0d6.netlify.app/memory-matching-game/memory-matcher.html',
      },
      arcadeTwoLeft: {
        type: 'EmbedDisplay',
        x: utils.withGrid(18),
        y: utils.withGrid(0),
        description:
          'solitaire game built using react and firebase (in development)', //v1s1tor0n3
        src: '/assets/characters/blankSquare.png',
        embedSrc: 'https://kev-morel-react-solitaire.netlify.app',
      },
      arcadeTwoRight: {
        type: 'EmbedDisplay',
        x: utils.withGrid(19),
        y: utils.withGrid(0),
        description:
          'solitaire game built using react and firebase (in development)',
        src: '/assets/characters/blankSquare.png',
        embedSrc: 'https://kev-morel-react-solitaire.netlify.app',
      },
      boomBox: {
        type: 'BoomBox',
        x: utils.withGrid(18),
        y: utils.withGrid(7),
        description: 'boom box',
        src: '/assets/objects/boomBox.png',
        album: 'theLiar',
        mp3s: [
          '/assets/mp3s/breathe.mp3',
          '/assets/mp3s/runRabbit.mp3',
          '/assets/mp3s/myFriend.mp3',
          '/assets/mp3s/itGoes.mp3',
          '/assets/mp3s/luck.mp3',
          '/assets/mp3s/choose.mp3',
          '/assets/mp3s/theLiar.mp3',
          '/assets/mp3s/thisToo.mp3',
          '/assets/mp3s/cityLimitSister(live).mp3',
        ],
        descriptions: [
          'Breathe',
          'Run rabbit',
          'My friend',
          'It goes',
          'Luck',
          'Choose',
          'The liar',
          'This too',
          'City limit sister (live)',
        ],
        cover: '/assets/theLiarImages/cover.jpg',
        coverDescription: 'Cover for The Liar album',
        srcs: [
          '/assets/theLiarImages/backCover.jpg',
          '/assets/theLiarImages/insideLeft.jpg',
          '/assets/theLiarImages/insideRight.jpg',
        ],
        imageDescriptions: [
          'Back cover for The liar album',
          'Inside-left cover for The liar album',
          'Inside-right cover for The liar album',
        ],
        texts: [
          `</br></br></br>The Liar was the first full studio album Kev produced </br></br></br></br> Contributors include... </br></br> Musicians: </br> Robert John (guitar, vocals) </br> Kev Morel (producer, percussion, backing vocals)</br> Phill Howley (drums, percussion)</br> Clement Neveu (bass)</br> Chris Ball (piano, keyboards)</br> Dan Bridgewood-Hill (violin)</br> T.E.Yates (mandolin)</br></br> Artwork: </br> Zimmy Iredale`,
          `</br></br></br></br></br></br> This album was also the first to be recorded at 'the Kennel' the headquarters for Dogface Records and was the inspiration for the foundation of the label </br></br> The DIY nature of the project became a theme for Dogface Records projects, with the label often handling all aspects of releasing records 'in-house'`,
          `</br></br></br></br></br></br> The Liar European tour was the first Rob and Kev organized and was the catalyst for most of their success in Germany </br></br> The team that worked on 'The liar' became the backbone of almost all Dogface Records projects, helping to promote the work of many of Manchester's unsung music heroes`,
        ],
      },
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
    configObjects: {
      hero: {
        type: 'Person',
        isPlayerControlled: true,
        // x: utils.withGrid(4),
        // y: utils.withGrid(3),
      },
      kev: {
        type: 'Person',
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
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Yep you've completed this game. I know it was quick, but it was just a cheap way to get you to look at my work anyway. I hope you enjoyed it",
                faceHero: 'kev',
              },
            ],
          },
          {
            required: ['DEFEATED_KEV'],
            events: [
              {
                type: 'textMessage',
                text: "You're truly ready. The musical light shines strong in you. Go and defeat Stan the Skeleton and you will definitely have earned the right to purchase my album at a discounted rate!",
                faceHero: 'kev',
              },
            ],
          },
          {
            required: ['DEFEATED_ROB'],
            events: [
              {
                type: 'textMessage',
                text: "'Hey! How are you enjoying the game?' say's Kev. 'Pretty good. Perhaps a bit linear' you reply. Kev shrugs",
                faceHero: 'kev',
              },
              {
                type: 'textMessage',
                text: "You've come a long way, young padwan! To be honest I kind of hope you win... Someone has to beat that pesky skeleton in my garden eventually!",
                faceHero: 'kev',
              },
              { type: 'battle', enemyId: 'kev' },
            ],
          },
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
      },
      rob: {
        type: 'Person',
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
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Yep you've completed this game. I know it was quick, but it was just a cheap way to get you to look at Kev's work anyway. I hope you enjoyed it",
                faceHero: 'rob',
              },
            ],
          },
          {
            required: ['DEFEATED_ROB'],
            events: [
              {
                type: 'textMessage',
                text: "You are one seriously tough individual! I think you might be ready to face off against the most eclectic music collection you're likely to see, Kev's... Good luck!",
                faceHero: 'rob',
              },
            ],
          },
          {
            required: ['DEFEATED_ALYS'],
            events: [
              {
                type: 'textMessage',
                text: 'Whoa! You beat Alys and Isla! Kev is gonna be pretty sore about that I imagine... You want to fight Kev? Then you will have to pit your collection against mine. Only rock classics here...',
                faceHero: 'rob',
              },
              { type: 'battle', enemyId: 'rob' },
            ],
          },
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
      },
      sdgPainting: {
        type: 'Painting',
        x: utils.withGrid(3),
        y: utils.withGrid(-1),
        description: "pictures of the band 'Still Down Gill'",
        src: '/assets/paintings/sdgPicture.png',
        imgSrc: [
          '/assets/pictures/SDG.jpeg',
          '/assets/pictures/SDG2.jpeg',
          '/assets/pictures/SDG3.jpeg',
          '/assets/pictures/SDG4.jpeg',
          '/assets/pictures/SDG5.jpeg',
          '/assets/pictures/SDG6.jpeg',
          '/assets/pictures/SDG7.jpeg',
          '/assets/pictures/SDG8.jpeg',
          '/assets/pictures/SDG9.jpeg',
          '/assets/pictures/SDG10.jpeg',
          '/assets/pictures/SDG11.jpeg',
        ],
      },
      dfrPainting: {
        type: 'Painting',
        x: utils.withGrid(5),
        y: utils.withGrid(-1),
        description:
          "random Dogface Records pictures inc. 'Forge On!' & 'Clark van Gelder'",
        src: '/assets/paintings/dfrPicture.png',
        imgSrc: [
          '/assets/pictures/CVG.jpeg',
          '/assets/pictures/CVG2.jpeg',
          '/assets/pictures/CVG3.jpeg',
          '/assets/pictures/dogface.jpeg',
          '/assets/pictures/dogface2.jpeg',
          '/assets/pictures/dogface3.jpeg',
          '/assets/pictures/dogface5.jpeg',
          '/assets/pictures/dogface6.jpeg',
          '/assets/pictures/dogface7.jpeg',
          '/assets/pictures/dogface8.jpeg',
          '/assets/pictures/dogface9.jpeg',
          '/assets/pictures/dogface10.jpeg',
          '/assets/pictures/forgeOn.jpeg',
          '/assets/pictures/forgeOn2.jpeg',
          '/assets/pictures/forgeOn3.jpeg',
          '/assets/pictures/forgeOn4.jpeg',
        ],
      },
      kevRobPainting: {
        type: 'Painting',
        x: utils.withGrid(14),
        y: utils.withGrid(-1),
        description:
          'pictures of Kev & Rob during their 12 years playing together',
        src: '/assets/paintings/kevRobPicture.png',
        imgSrc: [
          '/assets/pictures/kevRob3.jpeg',
          '/assets/pictures/kevRob4.jpeg',
          '/assets/pictures/kevRob5.jpeg',
          '/assets/pictures/kevRob6.jpeg',
          '/assets/pictures/kevRob7.jpeg',
          '/assets/pictures/kevRob8.jpeg',
          '/assets/pictures/kevRob9.jpeg',
          '/assets/pictures/kevRob10.jpeg',
          '/assets/pictures/kevRob11.jpeg',
          '/assets/pictures/kevRob12.jpeg',
          '/assets/pictures/kevRob13.jpeg',
          '/assets/pictures/kevRob14.jpeg',
          '/assets/pictures/kevRob15.jpeg',
          '/assets/pictures/kevRob16.jpeg',
        ],
      },
      robPainting: {
        type: 'Painting',
        x: utils.withGrid(10),
        y: utils.withGrid(-1),
        description:
          "pictures of Rob (Kev's long-suffering music collaborator)",
        src: '/assets/paintings/robPicture.png',
        imgSrc: [
          '/assets/pictures/rob.jpg',
          '/assets/pictures/rob2.jpeg',
          '/assets/pictures/rob3.jpeg',
          '/assets/pictures/rob4.jpeg',
          '/assets/pictures/rob5.jpeg',
          '/assets/pictures/rob6.jpeg',
        ],
      },
      kevPainting: {
        type: 'Painting',
        x: utils.withGrid(12),
        y: utils.withGrid(-1),
        description: 'pictures of Kev',
        src: '/assets/paintings/kevPicture.png',
        imgSrc: [
          '/assets/pictures/kev.jpeg',
          '/assets/pictures/kev2.jpeg',
          '/assets/pictures/kev4.jpeg',
          '/assets/pictures/kev5.jpeg',
          '/assets/pictures/kev6.jpeg',
          '/assets/pictures/kev7.jpeg',
          '/assets/pictures/kev8.jpeg',
          '/assets/pictures/kev9.jpeg',
          '/assets/pictures/kev10.jpeg',
          '/assets/pictures/kev11.jpeg',
          '/assets/pictures/kev12.jpeg',
          '/assets/pictures/kev13.jpeg',
          '/assets/pictures/kev14.jpeg',
          '/assets/pictures/kev15.jpeg',
          '/assets/pictures/kev16.jpeg',
          '/assets/pictures/kev17.jpeg',
          '/assets/pictures/kev18.jpeg',
        ],
      },
      miscPainting: {
        type: 'Painting',
        x: utils.withGrid(18),
        y: utils.withGrid(-1),
        description: "other band pics inc. 'the Consolations' & 'the Jannocks'",
        src: '/assets/paintings/miscPicture.png',
        imgSrc: [
          '/assets/pictures/consolations.jpeg',
          '/assets/pictures/consolations2.jpeg',
          '/assets/pictures/consolations3.jpeg',
          '/assets/pictures/consolations4.jpeg',
          '/assets/pictures/consolations5.jpeg',
          '/assets/pictures/consolations6.jpeg',
          '/assets/pictures/consolations7.jpeg',
          '/assets/pictures/consolations8.jpeg',
          '/assets/pictures/jannocks.jpeg',
          '/assets/pictures/jannocks2.jpeg',
          '/assets/pictures/jannocks3.jpeg',
          '/assets/pictures/jannocks4.jpeg',
          '/assets/pictures/jannocks5.jpeg',
          '/assets/pictures/lomax.jpeg',
          '/assets/pictures/wedding.jpeg',
        ],
      },
      boomBox: {
        type: 'BoomBox',
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        description: 'boom box',
        src: '/assets/objects/boomBox.png',
        album: 'flatPackGallows',
        mp3s: [
          '/assets/mp3s/deepRiverBlues.mp3',
          '/assets/mp3s/fuzzy.mp3',
          '/assets/mp3s/statistics.mp3',
          '/assets/mp3s/lucky7.mp3',
          '/assets/mp3s/family.mp3',
          '/assets/mp3s/jake.mp3',
          '/assets/mp3s/valkyrie.mp3',
          '/assets/mp3s/personalityVampire.mp3',
          '/assets/mp3s/overcookedOnOneSide.mp3',
          '/assets/mp3s/interlude.mp3',
          '/assets/mp3s/seed.mp3',
          '/assets/mp3s/transparent.mp3',
          '/assets/mp3s/dirtyOldLife.mp3',
        ],
        descriptions: [
          'Deep river blues',
          'Fuzzy',
          'Statistics',
          'Lucky 7',
          'Family',
          'Jake',
          'Valkyrie',
          'Personality vampire',
          'Overcooked on one side',
          'Interlude',
          'Seed',
          'Transparent',
          'Dirty old life',
        ],
        cover: '/assets/fpgImages/cover.jpg',
        coverDescription: 'Cover for Flat Pack Gallows album',
        srcs: [
          '/assets/fpgImages/coverBack.jpg',
          '/assets/fpgImages/coverInsideLeft.jpg',
          '/assets/fpgImages/coverInsideRight.jpeg',
        ],
        imageDescriptions: [
          'Back cover for Flat Pack Gallows album',
          'Inside-left cover for Flat Pack Gallows album',
          'Inside-right cover for Flat Pack Gallows album',
        ],
        texts: [
          `"Flat Pack Gallows was assembled with the help of friends and family" </br></br> Contributors include... </br></br> Musicians: </br> Ben Hayward (bass, classical guitar) </br> Biff Roxby (guitar, cello, horns)</br> Chris Ball (organ)</br> Clement Neveu (bass)</br> Ellis Davies (lead guitar)</br> Fran Lydiatt (keys/synths)</br> Jess Shenton (vocals)</br> Kev Morel (beats, guitar, synths, vox)</br> Matthew Cleghorn (lapsteel, mandolin)</br> Mickey Van Gelder (lead guitar)</br> Pat Clarke (harmonica)</br> Peer Che Faire (xylophone)</br> Phill Howley (brushes, percussion)</br> Robert John (bass, lead guitar)</br></br> Artwork: </br> Dan Morris </br> Zimmy Iredale`,
          `The album was fully funded thanks to a successful kickstarter campaign, several incredibly generous fans and Kev's awesome family.</br> This paid for CDs, t-shirts, mugs, posters, fliers and a European tour</br></br> Special thanks to: </br></br>Angie Fitzgerald</br>Biker FM</br>Gaz Seddon</br>Gerry Howley</br>James Barber</br>Jens Lengauer</br>Jo Bell</br>NABD</br>Pamela Morel</br>Peer Van See</br>Phil Morel</br>Rick Hulse</br>Vicky Morel</br></br>For all their support 💖`,
          `</br></br>The Flat Pack Gallows European Tour 2014 was the final and biggest of four European tours Kev organised with his long term musical partner Robert John:</br></br></br></br></br>01/10: THE VAULTS, Cirencester</br>02/10: DRUID'S CELLAR, Brugges</br>03/10: KREFELD UNPLUGGED, Krefeld</br>04/10: BLAUES HAUS, Mönchengladbach</br>05/10: FATSCH, Kalk</br>08/10: AKZENT, Landau</br>09/10: PALAIS RISCHER, Heidelberg</br>10/10: SCRUFFY'S, Kalsruhe</br>11/10: CLEARING BARREL, Kaiserslautern</br>14/10: SOFA CONCERTS, Stuttgart</br>16/10: HERTZSCHLAG, Brandenburg</br>17/10: HAVEL RESTAURANT, Brandenburg`,
        ],
      },
      tv: {
        type: 'VideoDisplay',
        x: utils.withGrid(17),
        y: utils.withGrid(7),
        description: 'tv',
        src: '/assets/objects/tvFace.png',
        videos: [
          'https://www.youtube.com/embed/XnRGbfs0_AQ',
          'https://www.youtube.com/embed/WtzMsuPQhcA',
          'https://www.youtube.com/embed/HZ0tkKDUo7g',
        ],
        descriptions: [
          'Rob and Kev - Kiss',
          'Robert John - Augustendiele',
          'Rob and Kev - Bang bang',
        ],
      },
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
    configObjects: {
      hero: {
        type: 'Person',
        isPlayerControlled: true,
        // x: utils.withGrid(10),
        // y: utils.withGrid(6),
      },
      isla: {
        type: 'Person',
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
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Yep you've completed this game. I know it was quick, but it was just a cheap way to get you to look at Kev's work anyway. I hope you enjoyed it",
                faceHero: 'isla',
              },
            ],
          },
          {
            required: ['DEFEATED_ALYS'],
            events: [
              {
                type: 'textMessage',
                text: 'Whoa! You beat Alys too!?! Have you been to see Kevvy and Rob yet?',
                faceHero: 'isla',
              },
            ],
          },
          {
            required: ['DEFEATED_ISLA'],
            events: [
              {
                type: 'textMessage',
                text: "Isla slow claps you sarcastically... Well done! You managed to beat a ten year old. Don't think that just because she's my little sister, that Alys will be any easier to beat. Good luck!",
                faceHero: 'isla',
              },
            ],
          },
          {
            required: ['DEFEATED_JIM'],
            events: [
              {
                type: 'textMessage',
                text: "You beat Jim eh? Well Jim wasn't brought up on anime like me. I learned my moves from One Punch Man. Prepare for destruction",
                faceHero: 'isla',
              },
              { type: 'battle', enemyId: 'isla' },
            ],
          },
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
      },
      alys: {
        type: 'Person',
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
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Yep you've completed this game. I know it was quick, but it was just a cheap way to get you to look at Kev's work anyway. I hope you enjoyed it",
                faceHero: 'alys',
              },
            ],
          },
          {
            required: ['DEFEATED_ALYS'],
            events: [
              {
                type: 'textMessage',
                text: 'Alys stares at you for a few seconds... I speak three languages you know: Spanish, Scottish and my own',
                faceHero: 'alys',
              },
            ],
          },
          {
            required: ['DEFEATED_ISLA'],
            events: [
              {
                type: 'textMessage',
                text: 'Nobody picks on my big sister! Shouts Alys. She is tiny, but you get the feeling her presence may be huge',
                faceHero: 'alys',
              },
              { type: 'battle', enemyId: 'alys' },
            ],
          },
          {
            required: ['DEFEATED_JIM'],
            events: [
              {
                type: 'textMessage',
                text: "If you want to challenge daddy, you will have to beat us first. ISLA ISLA there's someone here to battle with you...",
                faceHero: 'alys',
              },
            ],
          },
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
      },
      alysPainting: {
        type: 'Painting',
        x: utils.withGrid(13),
        y: utils.withGrid(-1),
        description: "pictures of Alys (Kev's youngest daughter)",
        src: '/assets/paintings/alysPicture.png',
        imgSrc: [
          '/assets/pictures/alys.jpg',
          '/assets/pictures/alys2.jpg',
          '/assets/pictures/alys3.jpg',
          '/assets/pictures/alys4.jpg',
          '/assets/pictures/alys5.jpg',
        ],
      },
      islaPainting: {
        type: 'Painting',
        x: utils.withGrid(15),
        y: utils.withGrid(-1),
        description: "pictures of Isla (Kev's eldest daughter)",
        src: '/assets/paintings/islaPicture.png',
        imgSrc: [
          '/assets/pictures/isla.jpg',
          '/assets/pictures/isla2.jpg',
          '/assets/pictures/isla3.jpg',
          '/assets/pictures/isla4.jpg',
          '/assets/pictures/isla5.jpg',
        ],
      },
      aiPainting: {
        type: 'Painting',
        x: utils.withGrid(17),
        y: utils.withGrid(-1),
        description: 'pictures of Isla and Alys',
        src: '/assets/paintings/aiPicture.png',
        imgSrc: [
          '/assets/pictures/ai.jpg',
          '/assets/pictures/ai2.jpg',
          '/assets/pictures/ai3.jpg',
          '/assets/pictures/ai4.jpg',
          '/assets/pictures/ai5.jpg',
          '/assets/pictures/ai6.jpg',
          '/assets/pictures/ai7.jpg',
        ],
      },
      tvL: {
        type: 'VideoDisplay',
        x: utils.withGrid(14),
        y: utils.withGrid(6),
        description: 'tvL',
        src: '/assets/characters/blankSquare.png',
        videos: [
          'https://www.youtube.com/embed/8enfGajCtU8',
          'https://www.youtube.com/embed/eNH0X7ujMmw',
          'https://player.vimeo.com/video/116650799?h=09c61505b1',
        ],
        descriptions: [
          'Kev Morel - Basement session',
          'Kev Morel - Augustendiele',
          'Kev Morel - Nachtigal',
        ],
      },
      tvR: {
        type: 'VideoDisplay',
        x: utils.withGrid(15),
        y: utils.withGrid(6),
        description: 'tvR',
        src: '/assets/characters/blankSquare.png',
        videos: [
          'https://www.youtube.com/embed/8enfGajCtU8',
          'https://www.youtube.com/embed/eNH0X7ujMmw',
          'https://player.vimeo.com/video/116650799?h=09c61505b1',
        ],
        descriptions: [
          'Kev Morel - Basement session',
          'Kev Morel - Augustendiele',
          'Kev Morel - Nachtigal',
        ],
      },
      coffeeTableNote: {
        type: 'GameObject',
        x: utils.withGrid(7),
        y: utils.withGrid(0),
        src: '/assets/characters/blankSquare.png',
        clickAction: [
          {
            events: [
              {
                type: 'textMessage',
                text: "What's next... SCRUM master certification, AWS cloud services certification, learn Go, learn TypeScript, build game editor, build zoo game",
              },
              {
                type: 'textMessage',
                text: 'You seem to have stumbled on Kev\'s ever-growing todo list... "That\'s dev life: Too much list, not enough me" - Andrea Catania',
              },
            ],
          },
        ],
      },
      bookcaseRight: {
        type: 'GameObject',
        x: utils.withGrid(8),
        y: utils.withGrid(-1),
        src: '/assets/characters/blankSquare.png',
        clickAction: [
          {
            events: [
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/youngKev.png',
                description: 'Kev aged 3',
                text: "The early years: </br></br> A long time ago, in a galaxy far far away (Ashington, near Newcastle-upon-Tyne) Kev Morel was born </br></br> He moved from Newcastle to Flash, near Buxton, Derbyshire and then the family settled in Poynton, Cheshire for 'The Highschool Years' and beyond </br></br> Kev then bought and renovated a house in Glossop, Derbyshire </br></br> After selling his house, Kev moved to Manchester city centre as his music career developed </br></br> In 2018 not long after his youngest daughter Alys was born, Kev moved with his family to New Mills, Derbyshire to enjoy the beautiful countryside of the Peak District",
              },
              {
                type: 'displayImageAndText',
                src: '/assets/pictures/fourNobodies.png',
                description: 'Kev in his first band "Four Nobodies"',
                text: "</br> Fun facts: </br></br> Kev first performed on stage in 1980 and has given somewhere in the region of 1000 public performances </br></br> Kev taught several instruments as a music tutor. The instruments he has played in front of an audience are: Drum kit, Cajon, Djembe, Bongos, Congas, Percussion, Guitar, Bass Guitar, Ukulele, Violin, Piano, Keyboard, Vocals and Backing Vocals </br></br> Kev's daughters Isla and Alys were both born in Olympic years (2012 and 2016) </br></br> Kev's first band 'Four Nobodies' (pictured left) was formed in 1992 and were finalists in the 'National Festival of Music for Youth'",
              },
            ],
          },
        ],
      },
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
    configObjects: {
      hero: {
        type: 'Person',
        isPlayerControlled: true,
        // x: utils.withGrid(10),
        // y: utils.withGrid(3),
      },
      skeleton: {
        type: 'Person',
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
            required: ['DEFEATED_STAN'],
            events: [
              {
                type: 'textMessage',
                text: "Your music taste is unbelievable! You will probably like Kev's album then! Here's a discount code: I_b3atStan",
                faceHero: 'skeleton',
              },
            ],
          },
          {
            required: ['DEFEATED_KEV'],
            events: [
              {
                type: 'textMessage',
                text: 'At last! Someone worthy of a battle... Prepare to be destroyed by the greatest in classical music',
                faceHero: 'skeleton',
              },
              { type: 'battle', enemyId: 'skeleton' },
            ],
          },
          {
            events: [
              {
                type: 'textMessage',
                text: "Hey there! I'm the final boss... Come back to fight me if you've beaten Kev. If you can beat me, I will give you a discount code for Kev's album, oooooh!",
                faceHero: 'skeleton',
              },
              // { type: 'battle', enemyId: 'mum' },
            ],
          },
        ],
      },
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
    configObjects: {
      hero: {
        type: 'Person',
        isPlayerControlled: true,
        // x: utils.withGrid(10),
        // y: utils.withGrid(3),
      },
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

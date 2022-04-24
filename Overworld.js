class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector('.game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.map = null;
  }

  startGameLoop() {
    const step = () => {
      //clear drawing before each frame is drawn
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //establish where camera is focused
      const cameraFocusItem = this.map.gameObjects.hero;

      //update all objects
      Object.values(this.map.gameObjects).forEach((object) => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        });
      });
      //draw lower layer
      this.map.drawLowerImage(this.ctx, cameraFocusItem);

      //draw game objects
      Object.values(this.map.gameObjects)
        .sort((a, b) => {
          return a.y - b.y;
        })
        .forEach((object) => {
          object.sprite.draw(this.ctx, cameraFocusItem);
        });
      //draw upper layer
      this.map.drawUpperImage(this.ctx, cameraFocusItem);

      if (!this.map.isPaused) {
        requestAnimationFrame(() => {
          step();
        });
      }
    };
    step();
  }
  bindActionInput() {
    new KeyPressListener('Enter', () => {
      //Is there an action to do?
      this.map.checkForActionCutscene();
    });
    new KeyPressListener('Escape', () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([{ type: 'pause' }]);
      }
    });
  }

  bindHeroPositionCheck() {
    document.addEventListener('PersonWalkingComplete', (e) => {
      if (e.detail.whoId === 'hero') {
        //hero's position changed
        this.map.checkForFootstepCutscene();
      }
    });
  }

  startMap(mapConfig, heroInitialState = null) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      this.map.removeWall(hero.x, hero.y);
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
      this.map.addWall(hero.x, hero.y);
    }

    this.progress.mapId = mapConfig.id;
    this.progress.startingHeroX = this.map.gameObjects.hero.x;
    this.progress.startingHeroY = this.map.gameObjects.hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  }

  async init() {
    const container = document.querySelector('.game-container');
    //create progress tracker
    this.progress = new Progress();

    //show title screen
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    const useSaveFile = await this.titleScreen.init(container);

    //load saves if exist
    let initialHeroState = null;
    if (useSaveFile) {
      //comment out all within this block to remove save or delete in devtools in browser
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
    }

    //load hud
    this.hud = new Hud();
    this.hud.init(document.querySelector('.game-container'));

    //start the first map
    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    //create controls
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();
    container.classList.add('sceneTransitionSlow');

    //start game
    this.startGameLoop();

    // this.map.startCutscene([
    //   {
    //     type: 'textMessage',
    //     text: 'You open your eyes. Your vision is blurred and your surroundings are unfamiliar. You thought you were visiting the portfolio site of Kev Morel, but instead you seem to be trapped in some sort of 8-bit nightmare!',
    //   },
    //   { who: 'hero', type: 'walk', direction: 'down' },
    //   { who: 'hero', type: 'walk', direction: 'down' },
    //   { who: 'hero', type: 'walk', direction: 'down' },
    //   { who: 'hero', type: 'walk', direction: 'down' },
    //   { who: 'hero', type: 'walk', direction: 'down' },
    //   { who: 'hero', type: 'walk', direction: 'down' },
    //   { who: 'slime', type: 'walk', direction: 'right' },
    //   { who: 'slime', type: 'walk', direction: 'right' },
    //   { who: 'slime', type: 'walk', direction: 'right' },
    //   { who: 'slime', type: 'walk', direction: 'right' },
    //   { who: 'slime', type: 'walk', direction: 'right' },
    //   { who: 'slime', type: 'walk', direction: 'right' },
    //   {
    //     type: 'textMessage',
    //     text: 'A friendly slime approaches and reassures you that this IS the portfolio site of Kev Morel and that exploring the site will reveal some of his projects... If you prefer a boring static website, use the laptop in the North East of this room',
    //   },
    //   {
    //     type: 'textMessage',
    //     text: 'You spot a note on the coffee table near the sofa... This could be a good place to start... USE "WASD" OR ARROW KEYS TO MOVE AROUND, "ENTER" TO INTERACT WITH STUFF, SPEAK TO PEOPLE AND SPEED UP TEXT AND "ESC" TO PAUSE OR SWAP VINYL',
    //   },
    //   { who: 'slime', type: 'stand', direction: 'right', time: 1000 },
    // ]);
  }
}

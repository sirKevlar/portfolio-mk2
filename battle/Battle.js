class Battle {
  constructor({ enemy, onComplete }) {
    this.enemy = enemy;
    this.onComplete = onComplete;

    this.combatants = {
      // player1: new Combatant(
      //   {
      //     ...Records.h001,
      //     team: 'player',
      //     hp: 30,
      //     maxHp: 50,
      //     xp: 75,
      //     maxXp: 100,
      //     level: 1,
      //     status: { type: 'groovy' },
      //     isPlayerControlled: true,
      //   },
      //   this
      // ),
      // player2: new Combatant(
      //   {
      //     ...Records.b001,
      //     team: 'player',
      //     hp: 30,
      //     maxHp: 50,
      //     xp: 75,
      //     maxXp: 100,
      //     level: 1,
      //     status: null,
      //     isPlayerControlled: true,
      //   },
      //   this
      // ),
      // enemy1: new Combatant(
      //   {
      //     ...Records.r001,
      //     team: 'enemy',
      //     hp: 20,
      //     maxHp: 50,
      //     xp: 20,
      //     maxXp: 100,
      //     level: 1,
      //   },
      //   this
      // ),
      // enemy2: new Combatant(
      //   {
      //     ...Records.t001,
      //     team: 'enemy',
      //     hp: 25,
      //     maxHp: 50,
      //     xp: 30,
      //     maxXp: 100,
      //     level: 1,
      //   },
      //   this
      // ),
    };

    this.activeCombatants = {
      player: null, // 'player1'
      enemy: null, // 'enemy1'
    };

    //add the Player team
    window.playerState.lineup.forEach((id) => {
      this.addCombatant(id, 'player', window.playerState.records[id]);
    });
    //add the enemy team
    Object.keys(this.enemy.records).forEach((key) => {
      this.addCombatant('e_' + key, 'enemy', this.enemy.records[key]);
    });

    //Start empty
    this.items = [];

    //add player items
    window.playerState.items.forEach((item) => {
      this.items.push({
        ...item,
        team: 'player',
      });
    });

    this.usedInstanceIds = {};
  }

  addCombatant(id, team, config) {
    this.combatants[id] = new Combatant(
      {
        ...Records[config.recordId],
        ...config,
        team,
        isPlayerControlled: team === 'player',
      },
      this
    );

    //populate first active record
    this.activeCombatants[team] = this.activeCombatants[team] || id;
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('Battle');
    this.element.innerHTML = `
        <div class="Battle_hero">
            <img src="${'/assets/characters/player.png'}" alt="Hero" />
        </div>
        <div class="Battle_enemy">
            <img src=${this.enemy.src} alt=${this.enemy.name} />
        </div>
        `;
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    this.playerTeam = new Team('player', 'Hero');
    this.enemyTeam = new Team('enemy', 'Opponent');

    Object.keys(this.combatants).forEach((key) => {
      let combatant = this.combatants[key];
      combatant.id = key;
      combatant.init(this.element);

      //Add to correct team
      if (combatant.team === 'player') {
        this.playerTeam.combatants.push(combatant);
      } else if (combatant.team === 'enemy') {
        this.enemyTeam.combatants.push(combatant);
      }
    });

    this.playerTeam.init(this.element);
    this.enemyTeam.init(this.element);

    this.turnCycle = new TurnCycle({
      battle: this,
      onNewEvent: (event) => {
        return new Promise((resolve) => {
          const battleEvent = new BattleEvent(event, this);
          battleEvent.init(resolve);
        });
      },
      onWinner: (winner) => {
        if (winner === 'player') {
          const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);
          const firstEnemyRecord = this.enemyTeam.combatants[0];
          const wonRecord = {
            hp: firstEnemyRecord.maxHp,
            level: firstEnemyRecord.level,
            maxHp: firstEnemyRecord.maxHp,
            maxXp: 100,
            recordId: firstEnemyRecord.recordId,
            status: null,
            xp: 0,
          };
          const playerState = window.playerState;
          playerState.storyFlags[
            `DEFEATED_${this.enemy.name.toUpperCase()}`
          ] = true;
          playerState.records[newId] = wonRecord;
          Object.keys(playerState.records).forEach((id) => {
            const playerStateRecord = playerState.records[id];
            const combatant = this.combatants[id];
            if (combatant) {
              playerStateRecord.hp = combatant.hp;
              playerStateRecord.xp = combatant.xp;
              playerStateRecord.maxXp = combatant.maxXp;
              playerStateRecord.level = combatant.level;
            }
          });

          //remove player used items
          playerState.items = playerState.items.filter((item) => {
            return !this.usedInstanceIds[item.instanceId];
          });

          //Send signal to update
          utils.emitEvent('PlayerStateUpdated');
        }

        this.element.remove();
        this.onComplete();
      },
    });
    this.turnCycle.init();
  }
}

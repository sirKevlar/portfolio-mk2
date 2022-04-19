class TurnCycle {
  //DW
  constructor({ battle, onNewEvent }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = 'player'; //or "enemy"
  }

  async turn() {
    //Get the caster
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    const enemyId =
      this.battle.activeCombatants[
        caster.team === 'player' ? 'enemy' : 'player'
      ];
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: 'submissionMenu',
      caster,
      enemy,
    });

    //stop here if we are replacing this record
    if (submission.replacement) {
      await this.onNewEvent({
        type: 'replace',
        replacement: submission.replacement,
      });
      await this.onNewEvent({
        type: 'textMessage',
        text: `Get up to full RPM, ${submission.replacement.name}!`,
      });
      this.nextTurn();
      return;
    }

    if (submission.instanceId) {
      this.battle.items = this.battle.items.filter(
        (item) => item.instanceId !== submission.instanceId
      );
    }

    const resultingEvents = caster.getReplacedEvents(submission.action.success);

    for (let i = 0; i < resultingEvents.length; i++) {
      const event = {
        ...resultingEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    //Did the target die?
    const targetDead = submission.target.hp <= 0;
    if (targetDead) {
      await this.onNewEvent({
        type: 'textMessage',
        text: `${submission.target.name} is scratched!`,
      });
    }

    //Do we have a winning team?
    const winner = this.getWinningTeam();
    if (winner) {
      await this.onNewEvent({
        type: 'textMessage',
        text: 'Winner!',
      });
      //END THE BATTLE -> TODO
      return;
    }

    //We have a dead target, but still no winner, so bring in a replacement
    if (targetDead) {
      const replacement = await this.onNewEvent({
        type: 'replacementMenu',
        team: submission.target.team,
      });
      await this.onNewEvent({
        type: 'replace',
        replacement: replacement,
      });
      await this.onNewEvent({
        type: 'textMessage',
        text: `${replacement.name} appears!`,
      });
    }

    //check for post events (events after turn submission)
    const postEvents = caster.getPostEvents();
    for (let i = 0; i < postEvents.length; i++) {
      const event = {
        ...postEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    //check for status expire
    const expiredEvent = caster.decrementStatus();
    if (expiredEvent) {
      await this.onNewEvent(expiredEvent);
    }

    this.nextTurn();
  }

  nextTurn() {
    this.currentTeam = this.currentTeam === 'player' ? 'enemy' : 'player';
    this.turn();
  }

  getWinningTeam() {
    let aliveTeams = {};
    Object.values(this.battle.combatants).forEach((c) => {
      if (c.hp > 0) {
        aliveTeams[c.team] = true;
      }
    });
    if (!aliveTeams['player']) {
      return 'enemy';
    }
    if (!aliveTeams['enemy']) {
      return 'player';
    }
    return null;
  }

  async init() {
    await this.onNewEvent({
      type: 'textMessage',
      text: "silence ensues. even the rustling leaves seem to pause in suspended animation. the sun dims and the wind holds it's breath as the gladiators enter the arena...",
    });

    //Start the first turn!
    this.turn();
  }
}

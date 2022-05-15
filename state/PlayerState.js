class PlayerState {
  constructor() {
    this.records = {
      r1: {
        recordId: 'n003',
        hp: 30,
        maxHp: 30,
        xp: 0,
        maxXp: 100,
        level: 1,
        status: null,
      },
      r2: {
        recordId: 'n004',
        hp: 30,
        maxHp: 30,
        xp: 0,
        maxXp: 100,
        level: 1,
        status: null,
      },
      r3: {
        recordId: 'n005',
        hp: 30,
        maxHp: 30,
        xp: 0,
        maxXp: 100,
        level: 1,
        status: null,
      },
    };
    this.lineup = ['r1', 'r2'];
    this.items = [
      { actionId: 'item_recoverHp', instanceId: 'item1' },
      { actionId: 'item_recoverHp', instanceId: 'item2' },
      { actionId: 'item_recoverHp', instanceId: 'item3' },
    ];
    this.storyFlags = { TALKED_TO_JIM: true, DEFEATED_MUM: true };
  }

  addRecord(recordId) {
    const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);
    this.records[newId] = {
      recordId,
      hp: 50,
      maxHp: 50,
      xp: 0,
      maxXp: 100,
      level: 1,
      status: null,
    };
    if (this.lineup.length < 3) {
      this.lineup.push(newId);
    }
    utils.emitEvent('LineupChanged');
    console.log(this);
  }

  swapLineup(oldId, incomingId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent('LineupChanged');
  }

  moveToFront(futureFrontId) {
    this.lineup = this.lineup.filter((id) => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);
    utils.emitEvent('LineupChanged');
  }
}
window.playerState = new PlayerState();

class Progress {
  constructor() {
    this.mapId = 'Office';
    this.startingHeroX = 0;
    this.startingHeroY = 0;
    this.startingHeroDirection = 'up';
    this.saveFileKey = 'KevMorelPortfolio_SaveFile1';
  }

  save() {
    window.localStorage.setItem(
      this.saveFileKey,
      JSON.stringify({
        mapId: this.mapId,
        startingHeroX: this.startingHeroX,
        startingHeroY: this.startingHeroY,
        startingHeroDirection: this.startingHeroDirection,
        playerState: {
          records: playerState.records,
          lineup: playerState.lineup,
          items: playerState.items,
          storyFlags: playerState.storyFlags,
        },
      })
    );
  }

  getSaveFile() {
    const file = window.localStorage.getItem(this.saveFileKey);
    return file ? JSON.parse(file) : null;
  }

  load() {
    const file = this.getSaveFile();
    if (file) {
      this.mapId = file.mapId;
      this.startingHeroX = file.startingHeroX;
      this.startingHeroY = file.startingHeroY;
      this.startingHeroDirection = file.startingHeroDirection;
      Object.keys(file.playerState).forEach((key) => {
        playerState[key] = file.playerState[key];
      });
    }
  }
}

class TitleScreen {
  constructor({ progress }) {
    this.progress = progress;
  }

  getOptions(resolve) {
    const safeFile = this.progress.getSaveFile();
    return [
      {
        label: 'New Game',
        description: "Check out Kev Morel's portfolio website",
        handler: () => {
          this.close();
          resolve();
        },
      },
      safeFile
        ? {
            label: 'Continue Game',
            description: 'Resume your journey with Kev',
            handler: () => {
              this.close();
              resolve(safeFile);
            },
          }
        : null,
    ].filter((v) => v);
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('TitleScreen');
    this.element.innerHTML = `
        <img class="TitleScreen_logo" src="/assets/maps/logo.png" alt="Kev Morel Portfolio" />
      `;
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
  }

  init(container) {
    return new Promise((resolve) => {
      this.createElement();
      container.appendChild(this.element);
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions(resolve));
    });
  }
}

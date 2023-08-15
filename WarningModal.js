class WarningModal {
  constructor(screenHeight, screenWidth) {
    (this.screenHeight = screenHeight),
      (this.screenWidth = screenWidth),
      (this.orientation = screenWidth < screenHeight ? 'Portrait' : 'Landscape');
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add(`ModalWarningScreen${this.orientation}`);
    this.element.innerHTML = `
            <div class="WarningScreenModal">
            <img class="WarningScreen_logo" src="/assets/maps/logo.png" alt="Kev Morel Portfolio" />
            <a class='magenta' href='https://www.kevmorelportfolio.com/'><h6 id="ModalMessage">Mobile/Tablet version not yet available, click me!</h6></a>
            </div>
          `;
  }

  init(container) {
    return new Promise((resolve) => {
      this.createElement();
      console.log(this);
      container.appendChild(this.element);
      return [
        {
          label: 'New Game',
          description: "Check out Kev Morel's portfolio website",
          handler: () => {
            this.close();
            resolve();
          },
        },
      ];
    });
  }
}

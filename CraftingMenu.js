class CraftingMenu {
  constructor({ records, onComplete }) {
    this.records = records;
    this.onComplete = onComplete;
  }

  getOptions() {
    return this.records.map(id => {
      const vinyl = Records[id];
      return {
        label: vinyl.name,
        description: vinyl.description,
        handler: () => {
          playerState.addRecord(id);
          this.close();
        }
      }
    })
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('CraftingMenu');
    this.element.classList.add('overlayMenu');
    this.element.innerHTML = `
          <h2>Create a Record</h2>
        `;
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions());

    container.appendChild(this.element);
  }
}

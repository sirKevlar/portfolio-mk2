class Battle {
  constructor() {}

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('Battle');
    this.element.innerHTML = `
        <div class="Battle_hero">
            <img src="${'/assets/characters/player.png'}" alt="Hero" />
        </div>
        <div class="Battle_enemy">
            <img src="${'/assets/characters/skeleton.png'}" alt="Enemy" />
        </div>
        `;
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
  }
}

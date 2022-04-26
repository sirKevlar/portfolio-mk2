class DisplayImage {
  constructor({ src, onComplete, description }) {
    this.src = src;
    this.description = description;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('DisplayImage');

    this.element.innerHTML = `
        <div class="DisplayImage_div">
        <img src="${this.src}" alt="${this.description}">
        </div>
        <button class="DisplayImage_button">Next</button>
      `;

    this.element.querySelector('button').addEventListener('click', () => {
      //close picture
      this.done();
    });

    this.actionListener = new KeyPressListener('Enter', () => {
      this.done();
    });
  }

  done() {
    this.element.remove();
    this.actionListener.unbind();
    this.onComplete();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
  }
}

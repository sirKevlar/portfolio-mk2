class DisplayImageAndText {
  constructor({ src, onComplete, description, text }) {
    this.src = src;
    this.description = description;
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('DisplayImageAndText');

    this.element.innerHTML = `
          <div class="DisplayImageAndText_div">
          <img class="DisplayImageAndText_img" src="${this.src}" alt="${this.description}">
          <p class="DisplayImageAndText_p" >${this.text}</p>
          </div>
          <button class="DisplayImageAndText_button">Next</button>
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

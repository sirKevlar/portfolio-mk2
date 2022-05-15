class DisplayEmbed {
  constructor({ src, onComplete, description }) {
    this.src = src;
    this.description = description;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('DisplayEmbed');

    this.element.innerHTML = `
      <div class="DisplayEmbed_div">
      <iframe class"DisplayEmbed_iframe" width="500" height="320" src=${this.src}></iframe>
      <p class="DisplayEmbed_p" >${this.description}</p>
      </div>
      <button class="DisplayEmbed_button">Next</button>
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

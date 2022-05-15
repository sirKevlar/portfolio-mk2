class DisplayVideos {
  constructor({ videos, onComplete, descriptions }) {
    this.videos = videos;
    this.descriptions = descriptions;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('DisplayVideos');

    this.element.innerHTML = `
        <div class="DisplayVideos_div">
          <div class="DisplayVideos_video">
            <iframe class="DisplayVideos_iframe" width="160" height="90" src=${this.videos[0]} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <p class="DisplayVideos_p">${this.descriptions[0]}</p>
          </div>
          <div class="DisplayVideos_video">
            <iframe class="DisplayVideos_iframe" width="160" height="90" src=${this.videos[1]} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <p class="DisplayVideos_p">${this.descriptions[1]}</p>
          </div>
          <div class="DisplayVideos_video">
            <iframe class="DisplayVideos_iframe" width="160" height="90" src=${this.videos[2]} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <p class="DisplayVideos_p">${this.descriptions[2]}</p>
          </div>
        </div>
        <button class="DisplayVideos_button">Next</button>
      `;
    this.element
      .querySelector('.DisplayVideos_button')
      .addEventListener('click', () => {
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

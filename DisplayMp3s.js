class DisplayMp3s {
  constructor({ mp3s, onComplete, descriptions, cover, coverDescription, album }) {
    this.album = album;
    this.mp3s = mp3s;
    this.descriptions = descriptions;
    this.cover = cover;
    this.coverDescription = coverDescription;
    this.onComplete = onComplete;
    this.element = null;
    this.stringInsertion = ``;
  }

  createElement() {
    console.log(this.coverDescription);
    this.mp3s.forEach((mp3, i) => {
      this.stringInsertion += `
    <div class="DisplayMp3s_mp3">
      <audio ${i === 0 ? 'autoplay' : ''} controls>
        <source src=${mp3} type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <p class="DisplayMp3s_p">${this.descriptions[i]}</p>
    </div>
    `;
    });

    this.element = document.createElement('div');
    this.element.classList.add('DisplayMp3s');

    this.element.innerHTML = `
          <div class="DisplayMp3s_cover">
            <img class="DisplayMp3s_coverImage" src=${this.cover} alt=${this.coverDescription}
          </div>
          <div class="DisplayMp3s_div ${this.album}">
          
          ${this.stringInsertion}

          </div>
          <button class="DisplayMp3s_button">Next</button>
      `;
    // <div class="DisplayMp3s_mp3">
    //   <audio autoplay controls>
    //     <source src=${this.mp3s[0]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[0]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[1]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[1]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[2]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[2]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[3]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[3]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[4]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[4]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[5]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[5]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[6]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[6]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[7]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[7]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[8]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[8]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[9]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[9]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[10]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[10]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[11]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[11]}</p>
    // </div>
    // <div class="DisplayMp3s_mp3">
    //   <audio controls>
    //     <source src=${this.mp3s[12]} type="audio/mpeg">
    //     Your browser does not support the audio element.
    //   </audio>
    //   <p class="DisplayMp3s_p">${this.descriptions[12]}</p>
    // </div>

    this.element
      .querySelector('.DisplayMp3s_button')
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

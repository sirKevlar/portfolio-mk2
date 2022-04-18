window.BattleAnimations = {
  async spin(event, onComplete) {
    const element = event.caster.recordElement;
    const animationClassName =
      event.caster.team === 'player' ? 'battle-spin-right' : 'battle-spin-left';
    element.classList.add(animationClassName);

    //Remove class when animation is fully complete
    element.addEventListener(
      'animationend',
      () => {
        element.classList.remove(animationClassName);
      },
      { once: true }
    );

    //Continue battle cycle when records collide so hp reduction is timed
    await utils.wait(100);
    onComplete();
  },

  async tinnitus(event, onComplete) {
    const { caster } = event;
    let div = document.createElement('div');
    div.classList.add('tinnitus-orb');
    div.classList.add(
      caster.team === 'player'
        ? 'battle-tinnitus-right'
        : 'battle-tinnitus-left'
    );
    div.innerHTML = `
    <svg viewBox="0 0 32 32" height="32">
      <circle cx="16" cy="16" r="16" fill="${event.color}" />
    </svg>
    `;

    //remove class when animation ends
    div.addEventListener('animationend', () => {
      div.remove();
    });

    //add to scene
    document.querySelector('.Battle').appendChild(div);

    await utils.wait(820);
    onComplete();
  },
};

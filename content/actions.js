window.Actions = {
  damage1: {
    name: 'kick drum "boom"',
    description: 'A kick in the soft bits (enemy loses 10 hp)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', damage: 10 },
    ],
  },
  groovyStatus: {
    name: 'In the groove',
    description: 'Give yourself groovy status (recover 5 hp per turn)',
    targetType: 'friendly',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'stateChange', status: { type: 'groovy', expiresIn: 3 } },
      {
        type: 'textMessage',
        text: '{CASTER} is fully seeing the beats (recover 5 hp per turn)',
      },
    ],
  },
  offKeyStatus: {
    name: 'tinnitus blast',
    description: 'Give your enemy offKey status (33% chance to miss)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'tinnitus', color: 'purple' },
      { type: 'stateChange', status: { type: 'offKey', expiresIn: 3 } },
      {
        type: 'textMessage',
        text: "{TARGET}'s tinnitus fires up. they can't quite hear properly! (33% chance to miss)",
      },
    ],
  },

  //items
  item_recoverStatus: {
    name: 'Music Tutor',
    description: 'Improves basic technique (remove friendly vinyl\'s status)',
    targetType: 'friendly',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses item: {ACTION}',
      },
      { type: 'stateChange', status: null },
      {
        type: 'textMessage',
        text: "{CASTER}'s technique improves (status removed)",
      },
    ],
  },
  item_recoverHp: {
    name: 'Wedding Feast',
    description: 'Any music pro needs a free meal (recover 10 hp)',
    targetType: 'friendly',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses item: {ACTION}',
      },
      { type: 'stateChange', recover: 10 },
      {
        type: 'textMessage',
        text: '{CASTER} is full of free food (10 hp recovered)',
      },
    ],
  },
};

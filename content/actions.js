window.Actions = {
  damage1: {
    name: 'kick drum "boom"',
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
};

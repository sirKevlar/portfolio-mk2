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
  damage2: {
    name: 'fender shred "fireball"',
    description: 'Shred so hard we on fire (enemy loses 8 hp + 1 hp per turn)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'tinnitus', color: 'red' },
      { type: 'stateChange', damage: 8 },
      { type: 'stateChange', status: { type: 'burnin', expiresIn: 100 } },
    ],
  },
  damage3: {
    name: 'blown amp "power leech"',
    description: 'It was turned up to 11 (steal 3 hp from enemy per turn)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', status: { type: 'leech', expiresIn: 100 } },
    ],
  },
  damage4: {
    name: 'snare "pop"',
    description: 'A punch in the brain (enemy loses 10 hp)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', damage: 10 },
    ],
  },
  damage5: {
    name: 'cymbal "crash"',
    description: 'Instant tinnitus (enemy loses 10 hp)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', damage: 10 },
    ],
  },
  damage6: {
    name: 'timpani "thunder"',
    description: 'A boom in the bowels (enemy loses 10 hp)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', damage: 10 },
    ],
  },
  damage7: {
    name: 'synth "screech"',
    description: 'A burst ear drum (enemy loses 10 hp)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', damage: 10 },
    ],
  },
  damage8: {
    name: 'alt "drone"',
    description: 'Instant depression (enemy loses 10 hp)',
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', damage: 10 },
    ],
  },
  damage9: {
    name: 'amp "crunch"',
    description: 'Instant depression (enemy loses 10 hp)',
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
  burninStatus: {
    name: "burnin'",
    description: "Give your enemy burnin' status (lose 2 hp per turn)",
    success: [
      {
        type: 'textMessage',
        text: '{CASTER} uses {ACTION}',
      },
      { type: 'animation', animation: 'tinnitus', color: 'red' },
      { type: 'stateChange', status: { type: 'burnin', expiresIn: 100 } },
      {
        type: 'textMessage',
        text: '{CASTER} shreds so hard that {TARGET} is on fire (lose 2 hp per turn)',
      },
    ],
  },

  //items
  item_recoverStatus: {
    name: 'Music Tutor',
    description: "Improves basic technique (remove friendly vinyl's status)",
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

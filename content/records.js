window.RecordTypes = {
  normal: 'normal',
  techno: 'techno',
  hiphop: 'hiphop',
  rock: 'rock',
  blues: 'blues',
};

window.Records = {
  t001: {
    name: 'There can be only one',
    artist: 'CJ Bolland',
    type: RecordTypes.techno,
    src: '/assets/objects/technoRecord.png',
    icon: '/assets/icons/techno.png',
    actions: ['damage1'],
    description: 'A lesson in filtering from CJ Bolland',
  },
  h001: {
    name: "Can't stop won't stop",
    artist: 'KRS One',
    type: RecordTypes.hiphop,
    src: '/assets/objects/hiphopRecord.png',
    icon: '/assets/icons/hiphop.png',
    actions: ['groovyStatus', 'offKeyStatus', 'damage1'],
    description: 'Lyrical learnings from the master MC KRSOne',
  },
  r001: {
    name: 'Ramble on',
    artist: 'Led Zepplin',
    type: RecordTypes.rock,
    src: '/assets/objects/rockRecord.png',
    icon: '/assets/icons/rock.png',
    actions: ['damage1'],
    description: 'Lord of the Rings inspired Led Zepplin',
  },
  b001: {
    name: 'Smokestack lightning',
    artist: "Howlin' Wolf",
    type: RecordTypes.blues,
    src: '/assets/objects/bluesRecord.png',
    icon: '/assets/icons/blues.png',
    actions: ['offKeyStatus', 'damage1'],
    description: 'Classic Blues from the Howlin\' Wolf',
  },
};

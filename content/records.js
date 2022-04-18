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
  },
  h001: {
    name: "Can't stop won't stop",
    artist: 'KRS One',
    type: RecordTypes.hiphop,
    src: '/assets/objects/hiphopRecord.png',
    icon: '/assets/icons/hiphop.png',
    actions: ['offKeyStatus', 'damage1'],
  },
  r001: {
    name: 'Ramble on',
    artist: 'Led Zepplin',
    type: RecordTypes.rock,
    src: '/assets/objects/rockRecord.png',
    icon: '/assets/icons/rock.png',
    actions: ['damage1'],
  },
};

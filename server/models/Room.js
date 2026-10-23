const { createModel } = require('./BaseModel');

const Room = createModel('rooms', {
  defaults: {
    floor: 1,
    operationalStatus: 'Available',
    notes: '',
  },
});

module.exports = Room;

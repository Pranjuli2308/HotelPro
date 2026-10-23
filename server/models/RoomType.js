const { createModel } = require('./BaseModel');

const RoomType = createModel('room_types', {
  jsonFields: ['amenities', 'images'],
  nestedFields: {
    'capacity.adults': 'capacity_adults',
    'capacity.children': 'capacity_children',
  },
  defaults: {
    description: '',
    capacity_adults: 2,
    capacity_children: 0,
    amenities: '[]',
    images: '[]',
    bedType: 'double',
    roomSize: 0,
    maxRooms: 1,
    status: 'active',
  },
});

module.exports = RoomType;

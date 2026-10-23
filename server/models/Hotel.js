const { createModel } = require('./BaseModel');

const Hotel = createModel('hotels', {
  jsonFields: ['images', 'amenities'],
  nestedFields: {
    'address.street': 'address_street',
    'address.city': 'address_city',
    'address.state': 'address_state',
    'address.country': 'address_country',
    'address.zipCode': 'address_zipCode',
    'contact.phone': 'contact_phone',
    'contact.email': 'contact_email',
    'contact.website': 'contact_website',
    'policies.checkInTime': 'policies_checkInTime',
    'policies.checkOutTime': 'policies_checkOutTime',
    'policies.cancellationHours': 'policies_cancellationHours',
    'policies.cancellationFeePercent': 'policies_cancellationFeePercent',
  },
  defaults: {
    description: '',
    starRating: 3,
    taxRate: 18,
    currency: 'INR',
    status: 'draft',
    images: '[]',
    amenities: '[]',
  },
});

module.exports = Hotel;

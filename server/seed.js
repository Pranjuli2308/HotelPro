/**
 * Database Seed Script
 * Run: node seed.js
 * Creates sample hotels, room types, rooms, and admin/staff/guest users
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const RoomType = require('./models/RoomType');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const seedDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      RoomType.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hotelpro.com',
      passwordHash: 'admin123',
      role: 'admin',
      phone: '+91-9876543210',
      status: 'active',
    });

    const staff = await User.create({
      name: 'Staff Member',
      email: 'staff@hotelpro.com',
      passwordHash: 'staff123',
      role: 'staff',
      phone: '+91-9876543211',
      status: 'active',
    });

    const guest = await User.create({
      name: 'John Guest',
      email: 'guest@hotelpro.com',
      passwordHash: 'guest123',
      role: 'guest',
      phone: '+91-9876543212',
      status: 'active',
    });

    console.log('Created users');

    // Create hotels
    const hotel1 = await Hotel.create({
      name: 'The Grand Palace Hotel',
      description: 'Experience luxury redefined at The Grand Palace Hotel. Nestled in the heart of Mumbai, our award-winning property offers breathtaking views, world-class dining, and unparalleled hospitality.',
      address: {
        street: '123 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001',
      },
      contact: {
        phone: '+91-22-12345678',
        email: 'info@grandpalace.com',
        website: 'https://grandpalace.hotelpro.com',
      },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Parking', 'Business Center', 'Concierge'],
      starRating: 5,
      policies: { checkInTime: '14:00', checkOutTime: '11:00', cancellationHours: 48, cancellationFeePercent: 25 },
      taxRate: 18,
      currency: 'INR',
      status: 'active',
      createdBy: admin._id,
    });

    const hotel2 = await Hotel.create({
      name: 'Serenity Beach Resort',
      description: 'A tranquil beachfront retreat in Goa offering stunning ocean views, private beach access, and rejuvenating spa experiences. Perfect for romantic getaways and family vacations.',
      address: {
        street: '45 Beach Road',
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        zipCode: '403001',
      },
      contact: {
        phone: '+91-832-1234567',
        email: 'info@serenitybeach.com',
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      ],
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Water Sports', 'Yoga', 'Parking'],
      starRating: 4,
      policies: { checkInTime: '15:00', checkOutTime: '12:00', cancellationHours: 24, cancellationFeePercent: 10 },
      taxRate: 18,
      currency: 'INR',
      status: 'active',
      createdBy: admin._id,
    });

    const hotel3 = await Hotel.create({
      name: 'Mountain View Lodge',
      description: 'Escape to the mountains at our charming lodge in Shimla. Surrounded by pine forests and snow-capped peaks, enjoy cozy rooms, local cuisine, and adventure activities.',
      address: {
        street: '78 Mall Road',
        city: 'Shimla',
        state: 'Himachal Pradesh',
        country: 'India',
        zipCode: '171001',
      },
      contact: {
        phone: '+91-177-1234567',
        email: 'info@mountainview.com',
      },
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
      ],
      amenities: ['WiFi', 'Restaurant', 'Fireplace', 'Hiking', 'Room Service', 'Parking', 'Library'],
      starRating: 3,
      policies: { checkInTime: '13:00', checkOutTime: '10:00', cancellationHours: 24, cancellationFeePercent: 0 },
      taxRate: 12,
      currency: 'INR',
      status: 'active',
      createdBy: admin._id,
    });

    console.log('Created hotels');

    // Assign staff to hotels
    staff.assignedHotels = [hotel1._id, hotel2._id];
    await staff.save({ validateBeforeSave: false });

    // Create room types for Hotel 1
    const rt1_deluxe = await RoomType.create({
      hotelId: hotel1._id,
      name: 'Deluxe Room',
      description: 'Elegant room with city views, king-size bed, marble bathroom, and premium amenities. 45 sq.m of pure luxury.',
      capacity: { adults: 2, children: 1 },
      amenities: ['King Bed', 'City View', 'Mini Bar', 'Safe', 'LED TV', 'Rain Shower', 'Bathrobe', 'Coffee Maker'],
      baseRate: 8500,
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      bedType: 'king',
      roomSize: 45,
      maxRooms: 10,
    });

    const rt1_suite = await RoomType.create({
      hotelId: hotel1._id,
      name: 'Executive Suite',
      description: 'Spacious suite with separate living area, panoramic sea views, jacuzzi tub, and exclusive lounge access. 85 sq.m.',
      capacity: { adults: 3, children: 2 },
      amenities: ['King Bed', 'Sea View', 'Jacuzzi', 'Living Area', 'Mini Bar', 'Lounge Access', 'Butler Service', 'Nespresso'],
      baseRate: 18500,
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
      bedType: 'suite',
      roomSize: 85,
      maxRooms: 5,
    });

    const rt1_standard = await RoomType.create({
      hotelId: hotel1._id,
      name: 'Standard Room',
      description: 'Comfortable room with modern amenities, queen bed, and garden views. Perfect for business travelers. 32 sq.m.',
      capacity: { adults: 2, children: 0 },
      amenities: ['Queen Bed', 'Garden View', 'LED TV', 'WiFi', 'Safe', 'Desk', 'Coffee Maker'],
      baseRate: 5500,
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
      bedType: 'queen',
      roomSize: 32,
      maxRooms: 15,
    });

    // Room types for Hotel 2
    const rt2_beach = await RoomType.create({
      hotelId: hotel2._id,
      name: 'Beach Villa',
      description: 'Private villa with direct beach access, outdoor shower, hammock, and stunning sunset views.',
      capacity: { adults: 2, children: 2 },
      amenities: ['King Bed', 'Beach Access', 'Private Pool', 'Outdoor Shower', 'Hammock', 'Mini Bar'],
      baseRate: 15000,
      images: ['https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800'],
      bedType: 'king',
      roomSize: 70,
      maxRooms: 6,
    });

    const rt2_garden = await RoomType.create({
      hotelId: hotel2._id,
      name: 'Garden Room',
      description: 'Serene room surrounded by tropical gardens with a private sit-out and pool view.',
      capacity: { adults: 2, children: 1 },
      amenities: ['Queen Bed', 'Garden View', 'Balcony', 'WiFi', 'Mini Fridge', 'Coffee Maker'],
      baseRate: 7500,
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
      bedType: 'queen',
      roomSize: 38,
      maxRooms: 12,
    });

    // Room types for Hotel 3
    const rt3_mountain = await RoomType.create({
      hotelId: hotel3._id,
      name: 'Mountain View Room',
      description: 'Cozy room with stunning mountain views, wooden interiors, and a private balcony. Includes fireplace.',
      capacity: { adults: 2, children: 1 },
      amenities: ['Double Bed', 'Mountain View', 'Fireplace', 'Balcony', 'WiFi', 'Heater', 'Hot Beverage Station'],
      baseRate: 4500,
      images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'],
      bedType: 'double',
      roomSize: 30,
      maxRooms: 10,
    });

    const rt3_cabin = await RoomType.create({
      hotelId: hotel3._id,
      name: 'Pine Cabin',
      description: 'Exclusive wooden cabin with living room, kitchenette, and panoramic valley views. Ideal for families.',
      capacity: { adults: 4, children: 2 },
      amenities: ['2 Double Beds', 'Valley View', 'Living Room', 'Kitchenette', 'Fireplace', 'Deck'],
      baseRate: 8000,
      images: ['https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800'],
      bedType: 'double',
      roomSize: 55,
      maxRooms: 4,
    });

    console.log('Created room types');

    // Create physical rooms
    const createRoomsForType = async (hotelId, roomTypeId, prefix, count, startFloor = 1) => {
      const rooms = [];
      for (let i = 1; i <= count; i++) {
        const floor = startFloor + Math.floor((i - 1) / 4);
        rooms.push({
          hotelId,
          roomTypeId,
          roomNumber: `${prefix}${String(i).padStart(2, '0')}`,
          floor,
          operationalStatus: 'Available',
        });
      }
      return Room.insertMany(rooms);
    };

    await createRoomsForType(hotel1._id, rt1_standard._id, '1', 15, 1);
    await createRoomsForType(hotel1._id, rt1_deluxe._id, '2', 10, 3);
    await createRoomsForType(hotel1._id, rt1_suite._id, '3', 5, 6);
    await createRoomsForType(hotel2._id, rt2_garden._id, 'G', 12, 1);
    await createRoomsForType(hotel2._id, rt2_beach._id, 'V', 6, 1);
    await createRoomsForType(hotel3._id, rt3_mountain._id, 'M', 10, 1);
    await createRoomsForType(hotel3._id, rt3_cabin._id, 'C', 4, 1);

    console.log('Created rooms');

    // Create sample bookings
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 3);

    await Booking.create({
      guestId: guest._id,
      hotelId: hotel1._id,
      roomTypeId: rt1_deluxe._id,
      checkIn: nextWeek,
      checkOut: nextWeekEnd,
      guests: { adults: 2, children: 0 },
      priceSnapshot: {
        nightlyRate: 8500,
        numberOfNights: 3,
        subtotal: 25500,
        taxRate: 18,
        taxAmount: 4590,
        totalAmount: 30090,
        currency: 'INR',
      },
      cancellationPolicySnapshot: { cancellationHours: 48, cancellationFeePercent: 25 },
      status: 'Confirmed',
    });

    console.log('Created sample bookings');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('🔑 Login credentials:');
    console.log('   Admin:  admin@hotelpro.com / admin123');
    console.log('   Staff:  staff@hotelpro.com / staff123');
    console.log('   Guest:  guest@hotelpro.com / guest123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();

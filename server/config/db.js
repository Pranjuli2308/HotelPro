const Database = require('better-sqlite3');
const path = require('path');

let db = null;

const connectDB = async () => {
  try {
    const dbPath = path.join(__dirname, '..', 'hotelpro.db');
    db = new Database(dbPath);

    // Enable WAL mode for better concurrent read performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        _id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'guest' CHECK(role IN ('guest', 'staff', 'admin')),
        phone TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'deactivated')),
        emailVerifiedAt TEXT DEFAULT NULL,
        assignedHotels TEXT DEFAULT '[]',
        refreshToken TEXT DEFAULT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS hotels (
        _id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        address_street TEXT DEFAULT '',
        address_city TEXT NOT NULL DEFAULT '',
        address_state TEXT DEFAULT '',
        address_country TEXT NOT NULL DEFAULT '',
        address_zipCode TEXT DEFAULT '',
        location_type TEXT DEFAULT 'Point',
        location_coordinates TEXT DEFAULT '[0,0]',
        timezone TEXT DEFAULT 'Asia/Kolkata',
        contact_phone TEXT DEFAULT '',
        contact_email TEXT DEFAULT '',
        contact_website TEXT DEFAULT '',
        images TEXT DEFAULT '[]',
        amenities TEXT DEFAULT '[]',
        starRating INTEGER DEFAULT 3,
        policies_checkInTime TEXT DEFAULT '14:00',
        policies_checkOutTime TEXT DEFAULT '11:00',
        policies_cancellationHours INTEGER DEFAULT 24,
        policies_cancellationFeePercent INTEGER DEFAULT 0,
        taxRate REAL DEFAULT 18,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'draft' CHECK(status IN ('active', 'inactive', 'draft')),
        createdBy TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (createdBy) REFERENCES users(_id)
      );

      CREATE TABLE IF NOT EXISTS room_types (
        _id TEXT PRIMARY KEY,
        hotelId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        capacity_adults INTEGER DEFAULT 2,
        capacity_children INTEGER DEFAULT 0,
        amenities TEXT DEFAULT '[]',
        baseRate REAL NOT NULL,
        images TEXT DEFAULT '[]',
        bedType TEXT DEFAULT 'double' CHECK(bedType IN ('single', 'double', 'queen', 'king', 'twin', 'suite')),
        roomSize REAL DEFAULT 0,
        maxRooms INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (hotelId) REFERENCES hotels(_id)
      );

      CREATE TABLE IF NOT EXISTS rooms (
        _id TEXT PRIMARY KEY,
        hotelId TEXT NOT NULL,
        roomTypeId TEXT NOT NULL,
        roomNumber TEXT NOT NULL,
        floor INTEGER DEFAULT 1,
        operationalStatus TEXT DEFAULT 'Available' CHECK(operationalStatus IN ('Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'OutOfService')),
        notes TEXT DEFAULT '',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (hotelId) REFERENCES hotels(_id),
        FOREIGN KEY (roomTypeId) REFERENCES room_types(_id),
        UNIQUE(hotelId, roomNumber)
      );

      CREATE TABLE IF NOT EXISTS bookings (
        _id TEXT PRIMARY KEY,
        bookingRef TEXT UNIQUE NOT NULL,
        guestId TEXT NOT NULL,
        hotelId TEXT NOT NULL,
        roomTypeId TEXT NOT NULL,
        roomId TEXT DEFAULT NULL,
        checkIn TEXT NOT NULL,
        checkOut TEXT NOT NULL,
        guests_adults INTEGER DEFAULT 1,
        guests_children INTEGER DEFAULT 0,
        priceSnapshot_nightlyRate REAL NOT NULL,
        priceSnapshot_numberOfNights INTEGER NOT NULL,
        priceSnapshot_subtotal REAL NOT NULL,
        priceSnapshot_taxRate REAL DEFAULT 0,
        priceSnapshot_taxAmount REAL DEFAULT 0,
        priceSnapshot_totalAmount REAL NOT NULL,
        priceSnapshot_currency TEXT DEFAULT 'INR',
        cancellationPolicySnapshot_cancellationHours INTEGER DEFAULT 24,
        cancellationPolicySnapshot_cancellationFeePercent INTEGER DEFAULT 0,
        status TEXT DEFAULT 'PendingPayment' CHECK(status IN ('PendingPayment', 'Confirmed', 'CheckedIn', 'CheckedOut', 'CancellationRequested', 'Cancelled', 'PaymentFailed', 'NoShow')),
        specialRequests TEXT DEFAULT '',
        checkedInAt TEXT DEFAULT NULL,
        checkedInBy TEXT DEFAULT NULL,
        checkedOutAt TEXT DEFAULT NULL,
        checkedOutBy TEXT DEFAULT NULL,
        cancelledAt TEXT DEFAULT NULL,
        cancellationReason TEXT DEFAULT '',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (guestId) REFERENCES users(_id),
        FOREIGN KEY (hotelId) REFERENCES hotels(_id),
        FOREIGN KEY (roomTypeId) REFERENCES room_types(_id),
        FOREIGN KEY (roomId) REFERENCES rooms(_id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        _id TEXT PRIMARY KEY,
        bookingId TEXT NOT NULL,
        provider TEXT DEFAULT 'razorpay' CHECK(provider IN ('razorpay', 'manual')),
        providerOrderId TEXT DEFAULT '',
        providerPaymentId TEXT DEFAULT '',
        providerSignature TEXT DEFAULT '',
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'Initiated' CHECK(status IN ('Initiated', 'Pending', 'Succeeded', 'Failed', 'RefundPending', 'PartiallyRefunded', 'Refunded')),
        idempotencyKey TEXT UNIQUE,
        refundAmount REAL DEFAULT 0,
        refundReason TEXT DEFAULT '',
        metadata TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (bookingId) REFERENCES bookings(_id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        _id TEXT PRIMARY KEY,
        bookingId TEXT NOT NULL UNIQUE,
        guestId TEXT NOT NULL,
        hotelId TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT DEFAULT '',
        moderationStatus TEXT DEFAULT 'pending' CHECK(moderationStatus IN ('pending', 'approved', 'rejected')),
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (bookingId) REFERENCES bookings(_id),
        FOREIGN KEY (guestId) REFERENCES users(_id),
        FOREIGN KEY (hotelId) REFERENCES hotels(_id)
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        _id TEXT PRIMARY KEY,
        actorId TEXT,
        hotelId TEXT,
        action TEXT NOT NULL,
        targetType TEXT DEFAULT '',
        targetId TEXT DEFAULT '',
        outcome TEXT DEFAULT 'success' CHECK(outcome IN ('success', 'failure')),
        metadata TEXT DEFAULT '{}',
        ipAddress TEXT DEFAULT '',
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS service_tasks (
        _id TEXT PRIMARY KEY,
        hotelId TEXT NOT NULL,
        roomId TEXT DEFAULT NULL,
        bookingId TEXT DEFAULT NULL,
        type TEXT NOT NULL CHECK(type IN ('housekeeping', 'maintenance', 'guest_request', 'inspection')),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        assignedTo TEXT DEFAULT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
        completedAt TEXT DEFAULT NULL,
        completedBy TEXT DEFAULT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (hotelId) REFERENCES hotels(_id),
        FOREIGN KEY (roomId) REFERENCES rooms(_id),
        FOREIGN KEY (bookingId) REFERENCES bookings(_id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(address_city);
      CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);
      CREATE INDEX IF NOT EXISTS idx_room_types_hotel ON room_types(hotelId, status);
      CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotelId, roomTypeId, operationalStatus);
      CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guestId, status);
      CREATE INDEX IF NOT EXISTS idx_bookings_hotel ON bookings(hotelId, checkIn, checkOut);
      CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(bookingRef);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(bookingId);
      CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(providerOrderId);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_reviews_hotel ON reviews(hotelId, moderationStatus);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actorId);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(createdAt);
      CREATE INDEX IF NOT EXISTS idx_service_tasks_hotel ON service_tasks(hotelId, status);
      CREATE INDEX IF NOT EXISTS idx_service_tasks_assigned ON service_tasks(assignedTo, status);
    `);

    console.log(`SQLite Connected: ${dbPath}`);
  } catch (error) {
    console.error(`SQLite connection error: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
};

module.exports = connectDB;
module.exports.getDB = getDB;

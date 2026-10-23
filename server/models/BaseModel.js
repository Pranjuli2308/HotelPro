/**
 * SQLite Model Wrapper
 * Provides a Mongoose-like API over better-sqlite3 so that controllers
 * require minimal changes.
 */
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');

/**
 * Create a model helper for a given table.
 * @param {string} tableName - The SQLite table name
 * @param {object} options - Model options
 * @param {object} options.jsonFields - Array field names stored as JSON strings
 * @param {object} options.nestedFields - Map of nested.field -> column_name
 */
function createModel(tableName, options = {}) {
  const {
    jsonFields = [],
    nestedFields = {},
    defaults = {},
  } = options;

  // Parse a row from SQLite, expanding JSON fields and nested fields
  const parseRow = (row) => {
    if (!row) return null;
    const parsed = { ...row };

    // Parse JSON fields
    jsonFields.forEach((field) => {
      if (parsed[field] && typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch {
          // leave as-is
        }
      }
    });

    // Build nested objects from flat columns
    const nestedGroups = {};
    Object.entries(nestedFields).forEach(([nestedPath, colName]) => {
      const parts = nestedPath.split('.');
      if (parts.length === 2) {
        const [group, field] = parts;
        if (!nestedGroups[group]) nestedGroups[group] = {};
        nestedGroups[group][field] = parsed[colName];
        delete parsed[colName];
      }
    });
    Object.assign(parsed, nestedGroups);

    // Add id alias
    if (parsed._id) {
      parsed.id = parsed._id;
    }

    return parsed;
  };

  // Flatten nested objects to flat columns for insertion/update
  const flattenForDB = (data) => {
    const flat = {};
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        // Check if this is a nested field group
        Object.entries(value).forEach(([subKey, subVal]) => {
          const nestedPath = `${key}.${subKey}`;
          const colName = nestedFields[nestedPath];
          if (colName) {
            flat[colName] = subVal;
          }
        });
      } else if (jsonFields.includes(key)) {
        flat[key] = JSON.stringify(value);
      } else if (Array.isArray(value)) {
        flat[key] = JSON.stringify(value);
      } else if (value instanceof Date) {
        flat[key] = value.toISOString();
      } else {
        flat[key] = value;
      }
    });
    return flat;
  };

  const model = {
    tableName,

    create: (data) => {
      const db = getDB();
      const id = data._id || uuidv4();
      const now = new Date().toISOString();

      // Apply defaults
      const withDefaults = { ...defaults, ...data };
      const flat = flattenForDB(withDefaults);
      flat._id = id;
      flat.createdAt = flat.createdAt || now;
      flat.updatedAt = flat.updatedAt || now;

      const columns = Object.keys(flat);
      const placeholders = columns.map(() => '?');
      const values = columns.map((col) => flat[col] ?? null);

      const stmt = db.prepare(
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`
      );
      stmt.run(...values);

      return model.findById(id);
    },

    findById: (id) => {
      const db = getDB();
      const row = db.prepare(`SELECT * FROM ${tableName} WHERE _id = ?`).get(id);
      return parseRow(row);
    },

    findOne: (where = {}) => {
      const db = getDB();
      const flat = flattenForDB(where);
      const conditions = Object.keys(flat).map((k) => `${k} = ?`);
      const values = Object.values(flat);

      if (conditions.length === 0) {
        const row = db.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get();
        return parseRow(row);
      }

      const row = db.prepare(
        `SELECT * FROM ${tableName} WHERE ${conditions.join(' AND ')} LIMIT 1`
      ).get(...values);
      return parseRow(row);
    },

    find: (where = {}, opts = {}) => {
      const db = getDB();
      const { sort, skip, limit, selectFields } = opts;

      let sql = `SELECT * FROM ${tableName}`;
      const params = [];

      if (Object.keys(where).length > 0) {
        const conditions = [];
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Handle operators like $in, $nin, $gte, $lte, $lt, $gt, $ne
            Object.entries(value).forEach(([op, opVal]) => {
              switch (op) {
                case '$in':
                  conditions.push(`${key} IN (${opVal.map(() => '?').join(',')})`);
                  params.push(...opVal);
                  break;
                case '$nin':
                  conditions.push(`${key} NOT IN (${opVal.map(() => '?').join(',')})`);
                  params.push(...opVal);
                  break;
                case '$gte':
                  conditions.push(`${key} >= ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$lte':
                  conditions.push(`${key} <= ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$lt':
                  conditions.push(`${key} < ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$gt':
                  conditions.push(`${key} > ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$ne':
                  conditions.push(`${key} != ?`);
                  params.push(opVal);
                  break;
                default:
                  // Nested field value
                  const colName = nestedFields[`${key}.${op}`];
                  if (colName) {
                    conditions.push(`${colName} = ?`);
                    params.push(opVal);
                  }
              }
            });
          } else {
            const colName = nestedFields[key] || key;
            conditions.push(`${colName} = ?`);
            params.push(value);
          }
        });

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
      }

      if (sort) {
        const sortParts = Object.entries(sort).map(([k, v]) => `${k} ${v === -1 ? 'DESC' : 'ASC'}`);
        sql += ` ORDER BY ${sortParts.join(', ')}`;
      }

      if (typeof limit === 'number') {
        sql += ` LIMIT ?`;
        params.push(limit);
      }

      if (typeof skip === 'number') {
        sql += ` OFFSET ?`;
        params.push(skip);
      }

      const rows = db.prepare(sql).all(...params);
      return rows.map(parseRow);
    },

    countDocuments: (where = {}) => {
      const db = getDB();
      let sql = `SELECT COUNT(*) as count FROM ${tableName}`;
      const params = [];

      if (Object.keys(where).length > 0) {
        const conditions = [];
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.entries(value).forEach(([op, opVal]) => {
              switch (op) {
                case '$in':
                  conditions.push(`${key} IN (${opVal.map(() => '?').join(',')})`);
                  params.push(...opVal);
                  break;
                case '$nin':
                  conditions.push(`${key} NOT IN (${opVal.map(() => '?').join(',')})`);
                  params.push(...opVal);
                  break;
                case '$gte':
                  conditions.push(`${key} >= ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$lte':
                  conditions.push(`${key} <= ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$lt':
                  conditions.push(`${key} < ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$gt':
                  conditions.push(`${key} > ?`);
                  params.push(opVal instanceof Date ? opVal.toISOString() : opVal);
                  break;
                case '$ne':
                  conditions.push(`${key} != ?`);
                  params.push(opVal);
                  break;
              }
            });
          } else {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        });

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
      }

      const row = db.prepare(sql).get(...params);
      return row.count;
    },

    findByIdAndUpdate: (id, updates, opts = {}) => {
      const db = getDB();
      const flat = flattenForDB(updates);
      flat.updatedAt = new Date().toISOString();

      const setParts = Object.keys(flat).map((k) => `${k} = ?`);
      const values = [...Object.values(flat), id];

      db.prepare(
        `UPDATE ${tableName} SET ${setParts.join(', ')} WHERE _id = ?`
      ).run(...values);

      if (opts.new !== false) {
        return model.findById(id);
      }
      return null;
    },

    findByIdAndDelete: (id) => {
      const db = getDB();
      const existing = model.findById(id);
      if (!existing) return null;
      db.prepare(`DELETE FROM ${tableName} WHERE _id = ?`).run(id);
      return existing;
    },

    updateOne: (where, updates) => {
      const db = getDB();
      const flat = flattenForDB(updates);
      flat.updatedAt = new Date().toISOString();
      const whereFlat = flattenForDB(where);

      const setParts = Object.keys(flat).map((k) => `${k} = ?`);
      const whereParts = Object.keys(whereFlat).map((k) => `${k} = ?`);
      const values = [...Object.values(flat), ...Object.values(whereFlat)];

      db.prepare(
        `UPDATE ${tableName} SET ${setParts.join(', ')} WHERE ${whereParts.join(' AND ')}`
      ).run(...values);
    },

    deleteMany: (where = {}) => {
      const db = getDB();
      if (Object.keys(where).length === 0) {
        db.prepare(`DELETE FROM ${tableName}`).run();
        return;
      }
      const flat = flattenForDB(where);
      const conditions = Object.keys(flat).map((k) => `${k} = ?`);
      db.prepare(
        `DELETE FROM ${tableName} WHERE ${conditions.join(' AND ')}`
      ).run(...Object.values(flat));
    },
  };

  return model;
}

module.exports = { createModel };

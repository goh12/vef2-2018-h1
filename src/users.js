const bcrypt = require('bcrypt');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_H1;

async function query(q, values = []) {
  const client = new Client({ connectionString });
  await client.connect();

  let result;

  try {
    result = await client.query(q, values);
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }

  return result;
}

async function comparePasswords(hash, password) {
  const result = await bcrypt.compare(hash, password);

  return result;
}

async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result.rowCount === 1) {
    delete result.rows[0].password;
    return result.rows[0];
  }

  return null;
}

async function createUser(username, password, name) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = 'INSERT INTO users (username, password, name) VALUES ($1, $2, $3) RETURNING *';

  const result = await query(q, [username, hashedPassword, name]);

  delete result.rows[0].password;
  return result.rows[0];
}

async function getUsers(limit, offset) {
  const q = 'SELECT id, username, name, imgurl FROM users ORDER BY id ASC LIMIT $1 OFFSET $2';

  const result = await query(q, [limit, offset]);

  return result.rows;
}

async function updateUser(id, name, password) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = 'UPDATE users SET password = $1, name = $2 WHERE id = $3 RETURNING *';
  const result = await query(q, [hashedPassword, name, id]);

  if (result.rowCount === 1) {
    delete result.rows[0].password;
    return result.rows[0];
  }

  return null;
}

async function addUserRead(userId, bookId, userRating, userReview) {
  const q = `INSERT INTO readBooks (userId, bookId, userRating, userReview)
   VALUES ($1, $2, $3, $4) RETURNING *`;

  const result = await query(q, [userId, bookId, userRating, userReview]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function getUserRead(userId, limit, offset) {
  const q = 'SELECT * FROM readbooks WHERE userId = $1 ORDER BY id ASC LIMIT $2 OFFSET $3';

  const result = await query(q, [userId, limit, offset]);

  return result.rows;
}

module.exports = {
  comparePasswords,
  findByUsername,
  findById,
  createUser,
  getUsers,
  updateUser,
  addUserRead,
  getUserRead,
};

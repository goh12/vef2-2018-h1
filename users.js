const bcrypt = require('bcrypt');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

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

async function getUsers() {
  const q = 'SELECT * FROM users ORDER BY id ASC LIMIT 10 OFFSET 0';

  const result = await query(q, []);

  result.rows.map(x => delete x.password);
  return result.rows;
}

async function updateUser(name, password, id) {
  const q = 'UPDATE users SET password = $2, name = $1 WHERE id = $3';

  const result = await query(q, [name, password, id]);

  console.log(result);
  return result.rows;
}

module.exports = {
  comparePasswords,
  findByUsername,
  findById,
  createUser,
  getUsers,
  updateUser,
};

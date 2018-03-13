const { Client } = require('pg');
const csv = require('csv-parser');
const fs = require('fs');

const filePath = './data/books.csv';

const q = 'INSERT INTO books (title, ISBN13, author, description, category) VALUES ($1, $2, $3, $4, $5)';
const categories = [];

async function seedDB() {
  const client = new Client({ connectionString: process.env.DATABASE_H1 });
  await client.connect();
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (data) => {
      try {
        if (!categories.includes(data.category)) {
          categories.push(data.category);
          await client.query('INSERT INTO categories (name) VALUES ($1)', [data.category]);
        }
        await client.query(
          q,
          [data.title, data.isbn13, data.author, data.description, data.category],
        );
      } catch (err) {
        console.log(err);
      }
    })
    .on('end', () => true);
}


async function run() {
  try {
    console.log('Begins..');
    await seedDB();
    console.log('End.');
  } catch (err) {
    console.log(err);
  }
}

run();

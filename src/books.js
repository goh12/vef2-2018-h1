const { Client } = require('pg');
const validator = require('validator');

const connectionString = process.env.DATABASE_H1;

/**
 *
 * @param {String} category
 * @returns true if category exists in database.
 */
async function validateCategory(category) {
  const client = new Client({ connectionString });
  await client.connect();

  const alreadyExists = await client.query(
    'SELECT * FROM categories WHERE name = $1',
    [category],
  );

  await client.end();
  if (alreadyExists.rows.length > 0) {
    return alreadyExists.rows.map((ob) => { /* eslint-disable-line */
      return { id: ob.id, name: ob.name };
    });
  }

  return false;
}

/**
 *
 * @param {JSON Object} book object containing the required fields of a book.
 * @returns false if every field meets its constraints, else a list of errors.
 */
async function validateBook(book) {
  const { title, isbn13, category } = book;
  const errors = [];

  if (!title || title.length < 1) errors.push('Title must not be empty string');
  if (!isbn13 || isbn13.length !== 13 || !validator.isNumeric(isbn13)) errors.push('isbn13 must be string containing 13 digits');
  if (!category || category.length < 1) errors.push('Category must not be empty string');
  if (category) {
    const exists = await validateCategory(category);
    if (!exists) {
      errors.push('Category must exist');
    }
  }

  if (errors.length > 0) return errors;
  return false;
}

/**
 *
 * @returns A promise containing a list holding all categories.
 */
async function getCategories() {
  const client = new Client({ connectionString });
  await client.connect();
  const results = await client.query('SELECT * FROM categories');
  await client.end();

  const listed = results.rows.map((ob) => { /* eslint-disable-line */
    return { id: ob.id, name: ob.name };
  });
  return listed;
}

/**
 *
 * @param {String} name
 * @returns Promise holding the results of the creation of a new category.
 */
async function createCategory(name) {
  if (name && name.length > 0) {
    const exists = await validateCategory(name);
    if (exists) return exists;

    const client = new Client({ connectionString });
    await client.connect();

    const results = await client.query(
      'INSERT INTO categories (name) VALUES ($1) returning id, name',
      [name],
    );
    await client.end();

    return results.rows.map((ob) => { /* eslint-disable-line */
      return { id: ob.id, name: ob.name };
    });
  }

  return { error: 'Category must not be empty string' };
}

/**
 *
 * @param {int} limit
 * @param {int} offset
 * @returns Promise holding a list of books of length LIMIT
 */
async function getBooks(limit = 10, offset = 0) {
  const client = new Client({ connectionString });
  await client.connect();
  const results = await client.query(
    'SELECT * FROM BOOKS ORDER BY id LIMIT $1 OFFSET $2',
    [limit, offset],
  );

  await client.end();
  const listed = results.rows.map((ob) => { /* eslint-disable-line */
    return {
      id: ob.id,
      title: ob.title,
      isbn13: ob.isbn13,
      author: ob.author,
      description: ob.description,
      category: ob.category,
    };
  });

  return listed;
}

/**
 *
 * @param {JSON object} book Object including the fields necessary for
 * creating a new book.
 * @returns Promise holding an object containing the new book or errors if post failed
 */
async function createBook(book) {
  const errors = await validateBook(book);
  if (errors) return { errors };

  const {
    title,
    isbn13,
    author,
    description,
    category,
  } = book;
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const results = await client.query(
      `INSERT INTO books (title, isbn13, author, description, category) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, author, description, isbn13, category`,
      [title, isbn13, author, description, category],
    );
    await client.end();

    return results.rows.map((ob) => { /* eslint-disable-line */
      return {
        id: ob.id,
        title: ob.title,
        isbn13: ob.isbn13,
        author: ob.author,
        description: ob.description,
        category: ob.category,
      };
    });
  } catch (err) {
    if (err.message.includes('books_title_key')) return { error: 'Make sure title does not already exist' };
    if (err.message.includes('books_isbn13_key')) return { error: 'Make sure isbn13 does not already exist' };
    return { error: 'Unexpected error' };
  }
}

/**
 *
 * @param {String} searchString
 * @returns Promise containing a list of all books that match the search
 */
async function searchBooks(limit, offset, searchString) {
  const client = new Client({ connectionString });
  await client.connect();

  const results = await client.query(
    `SELECT id, title, description, category, isbn13, author 
    FROM books WHERE to_tsvector(title || ' ' || description) @@ to_tsquery($1)
    LIMIT $2 OFFSET $3`,
    [searchString, limit, offset],
  );

  await client.end();
  return results.rows.map((ob) => { /* eslint-disable-line */
    return {
      id: ob.id,
      title: ob.title,
      author: ob.author,
      category: ob.category,
      isbn13: ob.isbn13,
      description: ob.description,
    };
  });
}

/**
 *
 * @param {int} id
 * @returns Promise containing the information of the book with the given id
 */
async function getBook(id) {
  const client = new Client({ connectionString });
  await client.connect();
  const results = await client.query(
    'SELECT * FROM BOOKS WHERE id = $1',
    [id],
  );
  await client.end();

  const listed = results.rows.map((ob) => { /* eslint-disable-line */
    return {
      id: ob.id,
      title: ob.title,
      isbn13: ob.isbn13,
      author: ob.author,
      description: ob.description,
      category: ob.category,
    };
  });

  if (listed.length === 0) return { error: `Book with id ${id} does not exist` };
  return listed[0];
}

/**
 *
 * @param {JSON Object} bookInfo object containing all relevant fields of a book
 * @returns Promise containing the updated Book or errors in case of failure.
 */
async function updateBook(bookInfo) {
  const errors = await validateBook(bookInfo);
  if (errors) return { errors };

  const {
    id,
    title,
    isbn13,
    author,
    description,
    category,
  } = bookInfo;
  if (!id) return { error: 'id of book must be included' };

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const results = await client.query(
      `UPDATE books SET (title, isbn13, author, description, category) = ($1, $2, $3, $4, $5)
      WHERE id = $6
      RETURNING id, title, author, description, isbn13, category`,
      [title, isbn13, author, description, category, id],
    );
    await client.end();

   return results.rows.map((ob) => { /* eslint-disable-line */
      return {
        id: ob.id,
        title: ob.title,
        isbn13: ob.isbn13,
        author: ob.author,
        description: ob.description,
        category: ob.category,
      };
    })[0];
  } catch (err) {
    if (err.message.includes('books_title_key')) return { error: 'Make sure title does not already exist' };
    if (err.message.includes('books_isbn13_key')) return { error: 'Make sure isbn13 does not already exist' };
    return { error: 'Unexpected error' };
  }
}

module.exports = {
  getCategories,
  createCategory,
  getBooks,
  createBook,
  getBook,
  updateBook,
  searchBooks,
};

const express = require('express');
const {
  getBooks,
  createBook,
  getBook,
  updateBook,
  searchBooks,
} = require('./books.js');

const router = express.Router();

/**
 * Logs error and sends error response to client.
 * @param {response} res
 * @param {error} err
 */
function logError(res) {
  return res.status(500).json({ error: 'Internal server error' });
}

/**
 *
 * @param {request object} req
 * @param {response object} res
 * @param {string} search
 * @returns Promise sending the results to client.
 */
async function getSearch(req, res, search) {
  const limit = req.get('paginglimit') || 10;
  const offset = req.get('pagingoffset') || 0;
  searchBooks(limit, offset, search)
    .then((results) => {
      res.status(200).json({ limit, offset, items: results });
    })
    .catch(() => {
      logError(res);
    });
}

router.get('/', (req, res) => {
  if (req.query.search) {
    getSearch(req, res, req.query.search);
  } else {
    const limit = req.get('paginglimit') || 10;
    const offset = req.get('pagingoffset') || 0;
    getBooks(limit, offset)
      .then(results => res.status(200).json({ limit, offset, items: results }))
      .catch(() => {
        logError(res);
      });
  }
});

router.post('/', (req, res) => {
  createBook(req.body)
    .then((results) => {
      if (results.error) return res.status(400).json({ error: req.errors });
      return res.status(200).json(results);
    })
    .catch(() => {
      logError(res);
    });
});

router.get('/:id', (req, res) => {
  getBook(req.params.id)
    .then((results) => {
      if (results.error) return res.status(400).json({ error: results.error });
      return res.status(200).json(results);
    })
    .catch(() => {
      logError(res);
    });
});

router.patch('/:id', (req, res) => {
  req.body.id = req.params.id;
  updateBook(req.body)
    .then((results) => {
      if (results.errors) return res.status(400).json({ error: results.errors });
      if (results.error) return res.status(400).json({ error: results.error });
      return res.status(200).json(results);
    })
    .catch(() => {
      logError(res);
    });
});

module.exports = router;

const express = require('express');
const {
  getCategories,
  createCategory,
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

function requireAuthentication(req, res, next) {
  if (!req.authenticated) {
    return res.status(401).json({ error: req.unauthenticatedError });
  }
  return next();
}

router.get('/', (req, res) => {
  getCategories()
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      logError(res, err);
    });
});

router.post('/', requireAuthentication, (req, res) => {
  createCategory(req.body.name)
    .then((results) => {
      if (results.error) return res.status(400).json(results);
      return res.status(200).json(results);
    })
    .catch((err) => {
      logError(res, err);
    });
});


module.exports = router;

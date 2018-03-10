const express = require('express');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function categoriesRoute(req, res) {
  return res.status(404).json({ error: 'Note not found' });
}

router.get('/books', catchErrors(categoriesRoute));

module.exports = router;

const express = require('express');
const { handleRedirect } = require('../controllers/redirect.controller');

const router = express.Router();

router.get('/:code', handleRedirect);

module.exports = router;
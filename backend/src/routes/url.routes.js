const express = require('express');
const { body } = require('express-validator');
const { createUrl, getUrls, getUrl, updateUrl, deleteUrl, bulkCreate, upload } = require('../controllers/url.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

const urlValidation = [
  body('originalUrl')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL (must start with http:// or https://)'),
  body('customAlias')
    .optional()
    .matches(/^[a-zA-Z0-9_-]{3,20}$/)
    .withMessage('Custom alias: 3-20 chars, letters/numbers/hyphens/underscores only'),
];

router.use(protect);

router.get('/', getUrls);
router.post('/', urlValidation, createUrl);
router.get('/:id', getUrl);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);
router.post('/bulk/csv', upload.single('file'), bulkCreate);

module.exports = router;
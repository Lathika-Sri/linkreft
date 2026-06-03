const { validationResult } = require('express-validator');
const { customAlphabet } = require('nanoid');
const csv = require('csv-parser');
const multer = require('multer');
const { Readable } = require('stream');
const Url = require('../models/Url.model');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Create a short URL
const createUrl = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalUrl, customAlias, title, description, expiresAt, tags } = req.body;

    // Handle custom alias
    let shortCode;
    if (customAlias) {
      const exists = await Url.findOne({ shortCode: customAlias });
      if (exists) {
        return res.status(409).json({ error: 'Custom alias already taken. Please choose another.' });
      }
      shortCode = customAlias;
    } else {
      // Generate unique short code
      let isUnique = false;
      while (!isUnique) {
        shortCode = nanoid();
        const existing = await Url.findOne({ shortCode });
        if (!existing) isUnique = true;
      }
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      user: req.user._id,
      title: title || '',
      description: description || '',
      expiresAt: expiresAt || null,
      tags: tags || [],
    });

    res.status(201).json({
      message: 'Short URL created!',
      url: {
        ...url.toJSON(),
        shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create short URL.' });
  }
};

// Get all URLs for user
const getUrls = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const [urls, total] = await Promise.all([
      Url.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .select('-visits'),
      Url.countDocuments(query),
    ]);

    const urlsWithShort = urls.map((u) => ({
      ...u.toJSON(),
      shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
    }));

    res.json({
      urls: urlsWithShort,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch URLs.' });
  }
};

// Get single URL
const getUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    res.json({
      url: {
        ...url.toJSON(),
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch URL.' });
  }
};

// Update URL
const updateUrl = async (req, res) => {
  try {
    const { originalUrl, title, description, expiresAt, tags, isActive } = req.body;

    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    if (originalUrl) url.originalUrl = originalUrl;
    if (title !== undefined) url.title = title;
    if (description !== undefined) url.description = description;
    if (expiresAt !== undefined) url.expiresAt = expiresAt;
    if (tags) url.tags = tags;
    if (isActive !== undefined) url.isActive = isActive;

    await url.save();

    res.json({
      message: 'URL updated!',
      url: {
        ...url.toJSON(),
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update URL.' });
  }
};

// Delete URL
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });
    res.json({ message: 'URL deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete URL.' });
  }
};

// Bulk CSV upload
const bulkCreate = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded.' });

  const results = [];
  const errors = [];

  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      const created = [];
      for (const row of results) {
        try {
          const { url: originalUrl, alias, title } = row;
          if (!originalUrl) continue;

          let shortCode;
          if (alias) {
            const exists = await Url.findOne({ shortCode: alias });
            shortCode = exists ? nanoid() : alias;
          } else {
            shortCode = nanoid();
          }

          const newUrl = await Url.create({
            originalUrl,
            shortCode,
            user: req.user._id,
            title: title || '',
          });

          created.push({
            originalUrl,
            shortUrl: `${process.env.BASE_URL}/${shortCode}`,
            shortCode,
          });
        } catch (err) {
          errors.push({ url: row.url, error: err.message });
        }
      }
      res.json({ created, errors, total: created.length });
    });
};

module.exports = { createUrl, getUrls, getUrl, updateUrl, deleteUrl, bulkCreate, upload };
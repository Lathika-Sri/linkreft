const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const Url = require('../models/Url.model');

const handleRedirect = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.redirect(`${process.env.FRONTEND_URL}/not-found`);
    }

    // Check expiry
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.redirect(`${process.env.FRONTEND_URL}/expired?code=${code}`);
    }

    // Check if active
    if (!url.isActive) {
      return res.redirect(`${process.env.FRONTEND_URL}/not-found`);
    }

    // Parse user agent
    const ua = req.headers['user-agent'] || '';
    const parser = new UAParser(ua);
    const result = parser.getResult();

    const device = result.device.type || 'Desktop';
    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';

    // Geo lookup
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || '';
    const cleanIp = ip.replace('::ffff:', '');
    const geo = geoip.lookup(cleanIp);

    const visit = {
      timestamp: new Date(),
      ip: cleanIp,
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      device: capitalizeFirst(device),
      browser,
      os,
      referrer: req.headers.referer || 'Direct',
      userAgent: ua.slice(0, 200),
    };

    // Update clicks and visits atomically
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clicks: 1 },
      $push: {
        visits: {
          $each: [visit],
          $slice: -500, // Keep last 500 visits per URL
        },
      },
    });

    return res.redirect(301, url.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
};

function capitalizeFirst(str) {
  if (!str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { handleRedirect };
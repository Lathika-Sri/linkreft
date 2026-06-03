const Url = require('../models/Url.model');

// Get analytics for a specific URL
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    const visits = url.visits || [];

    // Daily clicks for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyClicks[key] = 0;
    }

    visits.forEach((v) => {
      const date = new Date(v.timestamp).toISOString().split('T')[0];
      if (dailyClicks[date] !== undefined) {
        dailyClicks[date]++;
      }
    });

    const dailyData = Object.entries(dailyClicks)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Device breakdown
    const deviceStats = {};
    const browserStats = {};
    const countryStats = {};

    visits.forEach((v) => {
      deviceStats[v.device] = (deviceStats[v.device] || 0) + 1;
      browserStats[v.browser] = (browserStats[v.browser] || 0) + 1;
      countryStats[v.country] = (countryStats[v.country] || 0) + 1;
    });

    const toArray = (obj) =>
      Object.entries(obj)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Recent visits (last 20)
    const recentVisits = visits
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    const lastVisited = visits.length > 0
      ? visits.reduce((latest, v) => new Date(v.timestamp) > new Date(latest.timestamp) ? v : latest)
      : null;

    res.json({
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        title: url.title,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        isActive: url.isActive,
      },
      analytics: {
        totalClicks: url.clicks,
        lastVisited: lastVisited?.timestamp || null,
        recentVisits,
        dailyData,
        devices: toArray(deviceStats),
        browsers: toArray(browserStats),
        countries: toArray(countryStats),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

// Get dashboard overview stats
const getDashboardStats = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).select('clicks createdAt visits shortCode originalUrl title isActive');

    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);
    const activeUrls = urls.filter((u) => u.isActive).length;

    // Top URLs
    const topUrls = urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((u) => ({
        id: u._id,
        title: u.title || u.originalUrl,
        shortCode: u.shortCode,
        clicks: u.clicks,
        shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
      }));

    // Weekly clicks chart (last 7 days)
    const weeklyClicks = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weeklyClicks[date.toISOString().split('T')[0]] = 0;
    }

    urls.forEach((url) => {
      (url.visits || []).forEach((v) => {
        const date = new Date(v.timestamp).toISOString().split('T')[0];
        if (weeklyClicks[date] !== undefined) {
          weeklyClicks[date]++;
        }
      });
    });

    const weeklyData = Object.entries(weeklyClicks).map(([date, count]) => ({ date, count }));

    res.json({
      stats: { totalUrls, totalClicks, activeUrls, inactiveUrls: totalUrls - activeUrls },
      topUrls,
      weeklyData,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

// Public stats page
const getPublicStats = async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code }).select('-visits -user');
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    res.json({
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      title: url.title,
      clicks: url.clicks,
      createdAt: url.createdAt,
      isActive: url.isActive,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public stats.' });
  }
};

module.exports = { getUrlAnalytics, getDashboardStats, getPublicStats };
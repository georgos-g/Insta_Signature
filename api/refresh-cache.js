const { fetchInstagramPosts } = require('../lib/instagram');
const { updateCache, getCacheStatus } = require('../lib/cache');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Force refreshing Instagram cache...');
    const posts = await fetchInstagramPosts();
    const cacheInfo = await updateCache(posts);

    res.status(200).json({
      success: true,
      message: 'Cache refreshed successfully',
      ...cacheInfo,
      serverless: true,
    });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    const cacheStatus = getCacheStatus();

    res.status(500).json({
      success: false,
      error: error.message,
      ...cacheStatus,
      serverless: true,
    });
  }
};

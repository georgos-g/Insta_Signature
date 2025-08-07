const { getCacheStatus } = require('../lib/cache');

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
    const hasToken =
      !!process.env.INSTAGRAM_TOKEN || !!process.env.INSTAGRAM_ACCESS_TOKEN;
    const tokenLength = hasToken
      ? (process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN)
          .length
      : 0;

    const debugInfo = {
      environment: process.env.NODE_ENV || 'development',
      hasInstagramToken: hasToken,
      tokenLength: tokenLength,
      cacheStatus: getCacheStatus(),
      envVars: {
        SIGNATURE_NAME: !!process.env.SIGNATURE_NAME,
        SIGNATURE_TITLE: !!process.env.SIGNATURE_TITLE,
        SIGNATURE_COMPANY: !!process.env.SIGNATURE_COMPANY,
        MAX_POSTS: process.env.MAX_POSTS || '4',
        THUMBNAIL_SIZE: process.env.THUMBNAIL_SIZE || '80',
      },
      serverless: true,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Error in debug API:', error);
    res.status(500).json({
      error: 'Failed to get debug information',
      details: error.message,
    });
  }
};

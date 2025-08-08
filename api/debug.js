module.exports = async (req, res) => {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

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
      envVars: {
        SIGNATURE_NAME: !!process.env.SIGNATURE_NAME,
        SIGNATURE_TITLE: !!process.env.SIGNATURE_TITLE,
        SIGNATURE_COMPANY: !!process.env.SIGNATURE_COMPANY,
        SIGNATURE_EMAIL: !!process.env.SIGNATURE_EMAIL,
        SIGNATURE_PHONE: !!process.env.SIGNATURE_PHONE,
        SIGNATURE_MOBILE: !!process.env.SIGNATURE_MOBILE,
        SIGNATURE_WEBSITE: !!process.env.SIGNATURE_WEBSITE,
        SIGNATURE_ADDRESS_STREET: !!process.env.SIGNATURE_ADDRESS_STREET,
        SIGNATURE_ADDRESS_CITY: !!process.env.SIGNATURE_ADDRESS_CITY,
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
      stack: error.stack,
    });
  }
};

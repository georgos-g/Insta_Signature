const { testInstagramAPI } = require('../lib/instagram');

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
    const result = await testInstagramAPI();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in test-instagram API:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV || 'development',
    });
  }
};

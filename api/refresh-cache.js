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

    console.log('Force refreshing Instagram cache...');
    
    res.status(200).json({
      success: true,
      message: 'Cache refresh triggered (serverless functions refresh automatically)',
      serverless: true,
      note: 'In serverless architecture, each function call fetches fresh data',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in refresh-cache API:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      serverless: true,
    });
  }
};
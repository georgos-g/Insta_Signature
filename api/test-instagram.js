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

    const accessToken =
      process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(200).json({
        success: false,
        error: 'INSTAGRAM_TOKEN not configured',
        environment: process.env.NODE_ENV || 'development',
      });
    }

    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=1`;

    console.log(
      'Test Instagram API - Making request to:',
      url.replace(accessToken, '[TOKEN_HIDDEN]')
    );

    const response = await fetch(url);
    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(200).json({
        success: false,
        error: 'Failed to parse Instagram API response',
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseText: responseText,
        parseError: parseError.message,
        environment: process.env.NODE_ENV || 'development',
      });
    }

    res.status(200).json({
      success: true,
      responseStatus: response.status,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      data: data,
      tokenLength: accessToken.length,
      environment: process.env.NODE_ENV || 'development',
    });
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

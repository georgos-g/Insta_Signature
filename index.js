const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Serve email signature HTML
app.get('/signature', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signature.html'));
});

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

// For local development, we can still use the API routes
if (process.env.NODE_ENV !== 'production') {
  const { fetchInstagramPosts } = require('./lib/instagram');
  const {
    isCacheValid,
    updateCache,
    getPostsWithThumbnails,
    getCacheStatus,
  } = require('./lib/cache');

  // API endpoint to get Instagram posts (local development)
  app.get('/api/instagram-posts', async (req, res) => {
    try {
      if (!isCacheValid()) {
        console.log('Cache is invalid, fetching new Instagram posts...');
        const posts = await fetchInstagramPosts();
        await updateCache(posts);
      }

      const postsWithThumbnails = getPostsWithThumbnails();
      res.json(postsWithThumbnails);
    } catch (error) {
      console.error('Error in instagram-posts API:', error);
      res.status(500).json({
        error: 'Failed to fetch Instagram posts',
        details: error.message,
      });
    }
  });

  // Other API endpoints for local development
  app.get('/api/signature-config', (req, res) => {
    res.json({
      name: process.env.SIGNATURE_NAME || 'Your Name',
      title: process.env.SIGNATURE_TITLE || 'Your Title',
      company: process.env.SIGNATURE_COMPANY || 'Your Company',
      email: process.env.SIGNATURE_EMAIL || 'your.email@company.com',
      phone: process.env.SIGNATURE_PHONE || '+1 (555) 123-4567',
      website: process.env.SIGNATURE_WEBSITE || 'https://yourwebsite.com',
    });
  });

  app.get('/api/debug', (req, res) => {
    const hasToken =
      !!process.env.INSTAGRAM_TOKEN || !!process.env.INSTAGRAM_ACCESS_TOKEN;
    const tokenLength = hasToken
      ? (process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN)
          .length
      : 0;

    res.json({
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
      serverless: false,
    });
  });
}

// Export for Vercel
module.exports = app;

// Only listen when running directly (not when imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Instagram Email Signature server running on port ${PORT}`);
    console.log(`View signature at: http://localhost:${PORT}/signature`);
  });
}

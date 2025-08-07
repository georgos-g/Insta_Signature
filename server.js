const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const cron = require('node-cron');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Cache for Instagram posts
let instagramCache = {
  posts: [],
  lastUpdate: 0,
  thumbnails: new Map(),
};

// Ensure thumbnails directory exists
const thumbnailsDir = path.join(__dirname, 'public', 'thumbnails');

async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Fetch Instagram posts using Instagram Graph API
async function fetchInstagramPosts() {
  try {
    // Support both token variable names for backward compatibility
    const accessToken =
      process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      console.error(
        'Instagram access token not configured (INSTAGRAM_TOKEN or INSTAGRAM_ACCESS_TOKEN)'
      );
      return [];
    }

    console.log(
      `Fetching Instagram posts with limit: ${process.env.MAX_POSTS || 4}`
    );

    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=${
      process.env.MAX_POSTS || 4
    }`;

    const response = await fetch(url);
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('Instagram API Error:', data.error);
      throw new Error(data.error.message);
    }

    // If there is no data, return empty array
    if (!data || !data.data || data.data.length === 0) {
      console.log('No Instagram data returned');
      return [];
    }

    console.log(`Instagram API returned ${data.data.length} total posts`);

    const filteredPosts = data.data.filter(
      (post) =>
        post.media_type === 'IMAGE' ||
        post.media_type === 'CAROUSEL_ALBUM' ||
        post.media_type === 'VIDEO'
    );

    console.log(
      `After filtering: ${filteredPosts.length} image/carousel/video posts`
    );
    console.log(
      'Post types:',
      data.data.map((post) => `${post.id}: ${post.media_type}`)
    );

    return filteredPosts;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error.message || error);

    // Log more details for debugging
    console.log('Instagram API Error Details:', {
      hasToken: !!(process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN),
      tokenLength: (process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || '').length,
      environment: process.env.NODE_ENV
    });

    // Always return mock data for testing when there's an error
    console.log('Using mock Instagram data for testing...');
    return [
      {
        id: 'mock_1',
        media_type: 'IMAGE',
        media_url: 'https://picsum.photos/400/400?random=1',
        thumbnail_url: 'https://picsum.photos/400/400?random=1',
        permalink: 'https://instagram.com/p/mock1',
        caption: 'Mock Instagram post 1',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'mock_2',
        media_type: 'VIDEO',
        media_url: 'https://picsum.photos/400/400?random=2',
        thumbnail_url: 'https://picsum.photos/400/400?random=2',
        permalink: 'https://instagram.com/p/mock2',
        caption: 'Mock Instagram video 2',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'mock_3',
        media_type: 'CAROUSEL_ALBUM',
        media_url: 'https://picsum.photos/400/400?random=3',
        thumbnail_url: 'https://picsum.photos/400/400?random=3',
        permalink: 'https://instagram.com/p/mock3',
        caption: 'Mock Instagram carousel 3',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'mock_4',
        media_type: 'IMAGE',
        media_url: 'https://picsum.photos/400/400?random=4',
        thumbnail_url: 'https://picsum.photos/400/400?random=4',
        permalink: 'https://instagram.com/p/mock4',
        caption: 'Mock Instagram post 4',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

// Generate thumbnail from image URL
async function generateThumbnail(imageUrl, postId) {
  try {
    await ensureDirectoryExists(thumbnailsDir);

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const thumbnailSize = parseInt(process.env.THUMBNAIL_SIZE) || 80;
    // Calculate 3:4 aspect ratio dimensions
    const width = thumbnailSize;
    const height = Math.round((thumbnailSize * 4) / 3); // 3:4 ratio

    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailPath = path.join(thumbnailsDir, `${postId}.jpg`);
    await fs.writeFile(thumbnailPath, thumbnailBuffer);

    return `/thumbnails/${postId}.jpg`;
  } catch (error) {
    console.error(
      `Error generating thumbnail for post ${postId}:`,
      error.message
    );
    return null;
  }
}

// Update Instagram cache
async function updateInstagramCache() {
  console.log('Updating Instagram cache...');

  const posts = await fetchInstagramPosts();

  // Generate thumbnails for new posts
  for (const post of posts) {
    if (!instagramCache.thumbnails.has(post.id)) {
      const imageUrl = post.thumbnail_url || post.media_url;
      const thumbnailPath = await generateThumbnail(imageUrl, post.id);

      if (thumbnailPath) {
        instagramCache.thumbnails.set(post.id, thumbnailPath);
      }
    }
  }

  instagramCache.posts = posts;
  instagramCache.lastUpdate = Date.now();

  console.log(`Cache updated with ${posts.length} posts`);
}

// API endpoint to get Instagram posts
app.get('/api/instagram-posts', async (req, res) => {
  const cacheAge = Date.now() - instagramCache.lastUpdate;
  const cacheDuration = parseInt(process.env.CACHE_DURATION) || 3600000; // 1 hour

  if (cacheAge > cacheDuration || instagramCache.posts.length === 0) {
    await updateInstagramCache();
  }

  const postsWithThumbnails = instagramCache.posts
    .map((post) => ({
      ...post,
      thumbnail_path: instagramCache.thumbnails.get(post.id),
    }))
    .filter((post) => post.thumbnail_path);

  res.json(postsWithThumbnails);
});

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

// API endpoint to get signature configuration
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

// Debug endpoint to check environment variables and Instagram API
app.get('/api/debug', (req, res) => {
  const hasToken = !!process.env.INSTAGRAM_TOKEN || !!process.env.INSTAGRAM_ACCESS_TOKEN;
  const tokenLength = hasToken ? (process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN).length : 0;
  
  res.json({
    environment: process.env.NODE_ENV || 'development',
    hasInstagramToken: hasToken,
    tokenLength: tokenLength,
    cacheStatus: {
      postsCount: instagramCache.posts.length,
      lastUpdate: new Date(instagramCache.lastUpdate).toISOString(),
      thumbnailsCount: instagramCache.thumbnails.size
    },
    envVars: {
      SIGNATURE_NAME: !!process.env.SIGNATURE_NAME,
      SIGNATURE_TITLE: !!process.env.SIGNATURE_TITLE,
      SIGNATURE_COMPANY: !!process.env.SIGNATURE_COMPANY,
      MAX_POSTS: process.env.MAX_POSTS || '4',
      THUMBNAIL_SIZE: process.env.THUMBNAIL_SIZE || '80'
    }
  });
});

// Schedule cache updates every hour
cron.schedule('0 * * * *', updateInstagramCache);

// Initial cache update
updateInstagramCache();

app.listen(PORT, () => {
  console.log(`Instagram Email Signature server running on port ${PORT}`);
  console.log(`View signature at: http://localhost:${PORT}/signature`);
});

module.exports = app;

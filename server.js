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

// Fetch Instagram posts
async function fetchInstagramPosts() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('Instagram access token not configured');
      return [];
    }

    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=${
      process.env.MAX_POSTS || 4
    }`;
    const response = await axios.get(url);

    // If there is no data, return empty array
    if (
      !response.data ||
      !response.data.data ||
      response.data.data.length === 0
    ) {
      console.log('No Instagram data found');
      return [];
    }

    return response.data.data.filter(
      (post) =>
        post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM'
    );
  } catch (error) {
    console.error('Error fetching Instagram posts:', error.message);
    if (error.response) {
      console.error('Instagram API Error:', error.response.data);
    }
    return [];
  }
}

// Generate thumbnail from image URL
async function generateThumbnail(imageUrl, postId) {
  try {
    await ensureDirectoryExists(thumbnailsDir);

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const thumbnailSize = parseInt(process.env.THUMBNAIL_SIZE) || 80;
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
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

// API endpoint to get signature configuration
app.get('/api/signature-config', (req, res) => {
  res.json({
    name: process.env.SIGNATURE_NAME || 'Your Name',
    address: process.env.SIGNATURE_ADRESS || 'Your Address',
    city: process.env.SIGNATURE_CITY || 'Your City',
    zip: process.env.SIGNATURE_ZIP || '12345',
    country: process.env.SIGNATURE_COUNTRY || 'Your Country',
    title: process.env.SIGNATURE_TITLE || 'Your Title',
    company: process.env.SIGNATURE_COMPANY || 'Your Company',
    email: process.env.SIGNATURE_EMAIL || 'your.email@company.com',
    phone: process.env.SIGNATURE_PHONE || '+1 (555) 123-4567',
    mobile: process.env.SIGNATURE_MOBILE || '+1 (555) 987-6543',
    website: process.env.SIGNATURE_WEBSITE || 'https://yourwebsite.com',
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

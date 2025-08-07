const sharp = require('sharp');
const axios = require('axios');

// In-memory cache for serverless functions
// Note: This will be reset on each cold start, but helps with warm functions
let memoryCache = {
  posts: [],
  lastUpdate: 0,
  thumbnails: new Map(),
};

// For serverless, we'll use external storage or simplified caching
// This is a basic implementation that works across function calls

function getCacheAge() {
  return Date.now() - memoryCache.lastUpdate;
}

function isCacheValid() {
  const cacheDuration = parseInt(process.env.CACHE_DURATION) || 3600000; // 1 hour
  return getCacheAge() < cacheDuration && memoryCache.posts.length > 0;
}

function getCachedPosts() {
  return memoryCache.posts;
}

function setCachedPosts(posts) {
  memoryCache.posts = posts;
  memoryCache.lastUpdate = Date.now();
}

function getCachedThumbnail(postId) {
  return memoryCache.thumbnails.get(postId);
}

function setCachedThumbnail(postId, thumbnailPath) {
  memoryCache.thumbnails.set(postId, thumbnailPath);
}

// Generate thumbnail URL (for serverless, we'll use external URLs or base64)
async function generateThumbnailUrl(imageUrl, postId) {
  try {
    // For serverless functions, we'll return the original URL
    // as file system operations are limited
    // In production, you might want to use a service like Cloudinary

    if (postId.startsWith('mock_')) {
      return imageUrl; // Mock images are already proper URLs
    }

    // For real Instagram images, we can try to optimize them
    // but for now, return the original URL
    return imageUrl;
  } catch (error) {
    console.error(
      `Error processing thumbnail for post ${postId}:`,
      error.message
    );
    return imageUrl; // Fallback to original URL
  }
}

// Update cache with new posts and thumbnails
async function updateCache(posts) {
  console.log('Updating cache with', posts.length, 'posts');

  // Process thumbnails for posts that don't have them cached
  for (const post of posts) {
    if (!memoryCache.thumbnails.has(post.id)) {
      const imageUrl = post.thumbnail_url || post.media_url;
      const thumbnailUrl = await generateThumbnailUrl(imageUrl, post.id);
      memoryCache.thumbnails.set(post.id, thumbnailUrl);
    }
  }

  setCachedPosts(posts);

  console.log(`Cache updated with ${posts.length} posts`);
  return {
    postsCount: posts.length,
    thumbnailsCount: memoryCache.thumbnails.size,
    lastUpdate: new Date(memoryCache.lastUpdate).toISOString(),
  };
}

// Get posts with thumbnails
function getPostsWithThumbnails() {
  return memoryCache.posts
    .map((post) => ({
      ...post,
      thumbnail_path:
        memoryCache.thumbnails.get(post.id) ||
        post.thumbnail_url ||
        post.media_url,
    }))
    .filter((post) => post.thumbnail_path);
}

// Get cache status for debugging
function getCacheStatus() {
  return {
    postsCount: memoryCache.posts.length,
    lastUpdate: new Date(memoryCache.lastUpdate).toISOString(),
    thumbnailsCount: memoryCache.thumbnails.size,
    cacheAge: getCacheAge(),
    isValid: isCacheValid(),
  };
}

module.exports = {
  isCacheValid,
  getCachedPosts,
  setCachedPosts,
  getCachedThumbnail,
  setCachedThumbnail,
  updateCache,
  getPostsWithThumbnails,
  getCacheStatus,
  generateThumbnailUrl,
};

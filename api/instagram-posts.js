const { fetchInstagramPosts } = require('../lib/instagram');
const {
  isCacheValid,
  updateCache,
  getPostsWithThumbnails,
} = require('../lib/cache');

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
    // Check if cache is valid
    if (!isCacheValid()) {
      console.log('Cache is invalid, fetching new Instagram posts...');
      const posts = await fetchInstagramPosts();
      await updateCache(posts);
    } else {
      console.log('Using cached Instagram posts');
    }

    const postsWithThumbnails = getPostsWithThumbnails();

    res.setHeader('Cache-Control', 'public, s-maxage=3600'); // Cache for 1 hour
    res.status(200).json(postsWithThumbnails);
  } catch (error) {
    console.error('Error in instagram-posts API:', error);
    res.status(500).json({
      error: 'Failed to fetch Instagram posts',
      details: error.message,
    });
  }
};

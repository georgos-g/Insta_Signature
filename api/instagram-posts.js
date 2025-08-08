// Mock data for fallback
const MOCK_INSTAGRAM_POSTS = [
  {
    id: 'mock_1',
    media_type: 'IMAGE',
    media_url: 'https://picsum.photos/400/400?random=1',
    thumbnail_url: 'https://picsum.photos/400/400?random=1',
    permalink: 'https://instagram.com/p/mock1',
    caption: 'Mock Instagram post 1',
    timestamp: new Date().toISOString(),
    thumbnail_path: 'https://picsum.photos/400/400?random=1',
  },
  {
    id: 'mock_2',
    media_type: 'VIDEO',
    media_url: 'https://picsum.photos/400/400?random=2',
    thumbnail_url: 'https://picsum.photos/400/400?random=2',
    permalink: 'https://instagram.com/p/mock2',
    caption: 'Mock Instagram video 2',
    timestamp: new Date().toISOString(),
    thumbnail_path: 'https://picsum.photos/400/400?random=2',
  },
  {
    id: 'mock_3',
    media_type: 'CAROUSEL_ALBUM',
    media_url: 'https://picsum.photos/400/400?random=3',
    thumbnail_url: 'https://picsum.photos/400/400?random=3',
    permalink: 'https://instagram.com/p/mock3',
    caption: 'Mock Instagram carousel 3',
    timestamp: new Date().toISOString(),
    thumbnail_path: 'https://picsum.photos/400/400?random=3',
  },
  {
    id: 'mock_4',
    media_type: 'IMAGE',
    media_url: 'https://picsum.photos/400/400?random=4',
    thumbnail_url: 'https://picsum.photos/400/400?random=4',
    permalink: 'https://instagram.com/p/mock4',
    caption: 'Mock Instagram post 4',
    timestamp: new Date().toISOString(),
    thumbnail_path: 'https://picsum.photos/400/400?random=4',
  },
];

// Fetch Instagram posts
async function fetchInstagramPosts() {
  try {
    const accessToken = process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('Instagram access token not configured');
      return MOCK_INSTAGRAM_POSTS;
    }

    console.log(`Fetching Instagram posts with limit: ${process.env.MAX_POSTS || 4}`);

    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=${
      process.env.MAX_POSTS || 4
    }`;

    console.log('Instagram API URL:', url.replace(accessToken, '[TOKEN_HIDDEN]'));

    const response = await fetch(url);
    console.log('Instagram API Response Status:', response.status);

    const data = await response.json();
    console.log('Instagram API Response Data:', JSON.stringify(data, null, 2));

    // Check for API errors
    if (data.error) {
      console.error('Instagram API Error:', data.error);
      throw new Error(data.error.message);
    }

    // If there is no data, return mock data
    if (!data || !data.data || data.data.length === 0) {
      console.log('No Instagram data returned, using mock data');
      return MOCK_INSTAGRAM_POSTS;
    }

    console.log(`Instagram API returned ${data.data.length} total posts`);

    const filteredPosts = data.data.filter(
      (post) =>
        post.media_type === 'IMAGE' ||
        post.media_type === 'CAROUSEL_ALBUM' ||
        post.media_type === 'VIDEO'
    );

    // Add thumbnail_path for serverless (use original URLs)
    const postsWithThumbnails = filteredPosts.map(post => ({
      ...post,
      thumbnail_path: post.thumbnail_url || post.media_url,
    }));

    console.log(`After filtering: ${postsWithThumbnails.length} posts with thumbnails`);

    return postsWithThumbnails;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error.message || error);
    console.log('Using mock Instagram data due to error');
    return MOCK_INSTAGRAM_POSTS;
  }
}

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

    console.log('Loading Instagram posts...');

    const posts = await fetchInstagramPosts();
    
    console.log(`Returning ${posts.length} Instagram posts`);
    res.setHeader('Cache-Control', 'public, s-maxage=3600'); // Cache for 1 hour
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error in instagram-posts API:', error);
    res.status(500).json({
      error: 'Failed to fetch Instagram posts',
      details: error.message,
      stack: error.stack,
    });
  }
};
const axios = require('axios');

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
      return MOCK_INSTAGRAM_POSTS;
    }

    console.log(
      `Fetching Instagram posts with limit: ${process.env.MAX_POSTS || 4}`
    );

    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=${
      process.env.MAX_POSTS || 4
    }`;

    console.log(
      'Instagram API URL:',
      url.replace(accessToken, '[TOKEN_HIDDEN]')
    );

    const response = await axios.get(url, {
      timeout: 8000,
      // Do not throw on non-2xx so we can surface the response
      validateStatus: () => true,
    });
    console.log('Instagram API Response Status:', response.status);
    console.log('Instagram API Response Headers:', response.headers);

    const data = response.data;
    console.log('Instagram API Response Data:', JSON.stringify(data, null, 2));

    // Check for API errors
    if (data.error) {
      console.error('Instagram API Error:', data.error);
      throw new Error(data.error.message);
    }

    // If there is no data, return mock data
    if (!data || !data.data || data.data.length === 0) {
      console.log('No Instagram data returned - Data object:', data);
      console.log('Using mock Instagram data for testing...');
      return MOCK_INSTAGRAM_POSTS;
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
      hasToken: !!(
        process.env.INSTAGRAM_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN
      ),
      tokenLength: (
        process.env.INSTAGRAM_TOKEN ||
        process.env.INSTAGRAM_ACCESS_TOKEN ||
        ''
      ).length,
      environment: process.env.NODE_ENV,
    });

    // Return mock data for testing when there's an error
    console.log('Using mock Instagram data for testing...');
    return MOCK_INSTAGRAM_POSTS;
  }
}

// Test Instagram API directly
async function testInstagramAPI() {
  const accessToken = process.env.INSTAGRAM_TOKEN;

  if (!accessToken) {
    return {
      success: false,
      error: 'INSTAGRAM_TOKEN not configured',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=1`;

    console.log(
      'Test Instagram API - Making request to:',
      url.replace(accessToken, '[TOKEN_HIDDEN]')
    );

    const response = await axios.get(url, {
      timeout: 8000,
      validateStatus: () => true,
    });

    return {
      success: response.status >= 200 && response.status < 300,
      responseStatus: response.status,
      responseHeaders: response.headers,
      data: response.data,
      tokenLength: accessToken.length,
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

module.exports = {
  fetchInstagramPosts,
  testInstagramAPI,
  MOCK_INSTAGRAM_POSTS,
};

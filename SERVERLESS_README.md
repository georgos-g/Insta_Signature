# Serverless Architecture Migration

This project has been restructured to work optimally with Vercel's serverless functions.

## New Structure

```
/
├── api/                    # Serverless API functions
│   ├── debug.js           # Debug endpoint
│   ├── instagram-posts.js # Main Instagram posts API
│   ├── refresh-cache.js   # Force refresh cache
│   ├── signature-config.js # Signature configuration
│   └── test-instagram.js  # Instagram API testing
├── lib/                   # Shared utilities
│   ├── cache.js          # Caching logic
│   └── instagram.js      # Instagram API logic
├── public/               # Static files
├── index.js             # Main server (for local dev and static serving)
├── server.js           # Old monolithic server (kept for reference)
└── vercel.json         # Vercel configuration
```

## Key Changes

### 1. Serverless Functions

Each API endpoint is now a separate serverless function in the `/api` directory:

- `/api/instagram-posts` - Main Instagram posts endpoint
- `/api/test-instagram` - Instagram API testing
- `/api/signature-config` - Signature configuration
- `/api/debug` - Debug information
- `/api/refresh-cache` - Force cache refresh

### 2. Shared Libraries

Common functionality moved to `/lib`:

- `instagram.js` - Instagram API calls and error handling
- `cache.js` - In-memory caching for serverless functions

### 3. Improved Caching

The caching system has been adapted for serverless:

- In-memory cache that persists during warm function execution
- Graceful fallback to mock data when Instagram API fails
- Simplified thumbnail handling (uses original URLs for now)

### 4. CORS Support

All API functions include proper CORS headers for cross-origin requests.

## Benefits

1. **Better Performance**: Each function can scale independently
2. **Improved Reliability**: Function isolation prevents one endpoint from affecting others
3. **Easier Debugging**: Separate logs for each function
4. **Simplified Deployment**: Automatic function deployment with Vercel
5. **Better Error Handling**: Isolated error handling per function

## Local Development

For local development, the `index.js` server includes all API endpoints:

```bash
npm run dev
```

## Production Deployment

On Vercel, each API function runs as a separate serverless function:

- Better cold start performance
- Independent scaling
- Isolated error handling

## Environment Variables

All environment variables remain the same:

- `INSTAGRAM_TOKEN` - Instagram access token
- `SIGNATURE_NAME` - Your name
- `SIGNATURE_TITLE` - Your job title
- `SIGNATURE_COMPANY` - Company name
- `SIGNATURE_EMAIL` - Email address
- `SIGNATURE_PHONE` - Phone number
- `SIGNATURE_WEBSITE` - Website URL
- `MAX_POSTS` - Number of posts to fetch (default: 4)
- `CACHE_DURATION` - Cache duration in milliseconds (default: 3600000)

## API Endpoints

All endpoints remain the same, but now run as serverless functions:

- `GET /api/instagram-posts` - Get Instagram posts with thumbnails
- `GET /api/signature-config` - Get signature configuration
- `GET /api/debug` - Get debug information
- `GET /api/test-instagram` - Test Instagram API directly
- `GET /api/refresh-cache` - Force refresh Instagram cache
- `GET /signature` - Signature page
- `GET /` - Homepage

## Troubleshooting

1. **Cold Starts**: First request to a function may be slower
2. **Memory Cache**: Cache resets on cold starts (use external cache for production)
3. **File System**: Limited file system access in serverless functions
4. **Timeouts**: Functions timeout after 10 seconds on Vercel's free plan

## Migration Notes

The old `server.js` file is kept for reference. The new structure maintains full backward compatibility while providing better serverless performance.

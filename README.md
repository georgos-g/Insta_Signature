# 📧 Dynamic Email Signature with Instagram Posts

A modern serverless Node.js application that creates a dynamic email signature displaying your latest Instagram posts as thumbnail images below your contact information.

## ✨ Features

- **Dynamic Instagram Integration**: Automatically fetches and displays your latest Instagram posts
- **Serverless Architecture**: Optimized for Vercel with individual serverless functions
- **Responsive Design**: Email-compatible HTML that works across different email clients
- **Automatic Thumbnails**: Generates optimized thumbnail images for email signatures
- **In-Memory Caching**: Smart caching system for optimal performance
- **Easy Configuration**: Simple environment-based configuration
- **Copy-Paste Ready**: Generates HTML that can be directly copied to email clients
- **Address Support**: Includes full address fields for professional signatures
- **Mobile & Phone**: Supports both mobile and landline phone numbers

## 🏗️ Architecture

This project uses a modern serverless architecture optimized for Vercel:

```
/
├── api/                    # Serverless API functions
│   ├── debug.js           # Debug endpoint
│   ├── instagram-posts.js # Main Instagram posts API
│   ├── refresh-cache.js   # Force refresh cache
│   ├── signature-config.js # Signature configuration
│   └── test-instagram.js  # Instagram API testing
├── lib/                   # Shared utilities
│   ├── cache.js          # Caching logic for serverless functions
│   └── instagram.js      # Instagram API calls and error handling
├── public/               # Static files and signature HTML
├── index.js             # Main server (for local development)
├── server.js           # Legacy monolithic server (for reference)
└── vercel.json         # Vercel deployment configuration
```

### Serverless Benefits

1. **Better Performance**: Each function scales independently
2. **Improved Reliability**: Function isolation prevents cascading failures
3. **Easier Debugging**: Separate logs for each function
4. **Automatic Scaling**: Vercel handles traffic spikes automatically
5. **Cost Effective**: Pay only for actual function execution time

## 🚀 Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Instagram API

1. Create a Facebook Developer account at [developers.facebook.com](https://developers.facebook.com)
2. Create a new app and enable Instagram Basic Display API
3. Get your Instagram Access Token (simplified method - no Business Account ID needed)
4. Update the `.env` file with your credentials:

```env
# Instagram API Configuration
INSTAGRAM_TOKEN=your_instagram_access_token_here

# Personal Information
SIGNATURE_NAME=Your Name
SIGNATURE_TITLE=Your Title
SIGNATURE_COMPANY=Your Company
SIGNATURE_EMAIL=your.email@company.com
SIGNATURE_PHONE=+1 (555) 123-4567
SIGNATURE_MOBILE=+1 (555) 987-6543
SIGNATURE_WEBSITE=https://yourwebsite.com

# Address Information
SIGNATURE_ADDRESS_STREET=123 Main Street
SIGNATURE_ADDRESS_POSTAL_CODE=12345
SIGNATURE_ADDRESS_CITY=Your City
SIGNATURE_ADDRESS_COUNTRY=Your Country
```

### 3. Start the Server

```bash
# Development mode with auto-restart
yarn dev

# Production mode
yarn start
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/georgos-g/Insta_Signature)

#### Manual Deployment

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - `INSTAGRAM_TOKEN` - Your Instagram access token
   - `SIGNATURE_NAME` - Your name
   - `SIGNATURE_TITLE` - Your job title
   - `SIGNATURE_COMPANY` - Your company
   - `SIGNATURE_EMAIL` - Your email
   - `SIGNATURE_PHONE` - Your phone
   - `SIGNATURE_MOBILE` - Your mobile phone
   - `SIGNATURE_WEBSITE` - Your website
   - `SIGNATURE_ADDRESS_STREET` - Street address
   - `SIGNATURE_ADDRESS_POSTAL_CODE` - Postal/ZIP code
   - `SIGNATURE_ADDRESS_CITY` - City
   - `SIGNATURE_ADDRESS_COUNTRY` - Country
   - `MAX_POSTS` - Number of posts (default: 4)
   - `THUMBNAIL_SIZE` - Thumbnail width (default: 80)

### Serverless Architecture on Vercel

Each API endpoint runs as an independent serverless function:

- **Cold start optimization**: Functions start quickly
- **Automatic scaling**: Handles traffic spikes seamlessly
- **Independent deployment**: Each function can be updated separately
- **Built-in monitoring**: Vercel provides detailed function logs

### 4. Generate Your Signature

1. Open your browser to `http://localhost:3000/signature` (local) or `https://your-vercel-url.vercel.app/signature` (production)
2. Customize your contact information in the `.env` file or Vercel environment variables
3. Copy the generated HTML signature
4. Paste it into your email client's signature settings

## 📱 Instagram API Setup

### Getting Your Instagram Access Token (Simplified Method)

1. **Create Facebook App**:

   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create a new app (Consumer or Business)
   - Add Instagram Basic Display product

2. **Get User Access Token**:

   - In your app dashboard, go to Instagram Basic Display
   - Create a new Instagram App
   - Add a test user (yourself)
   - Generate an Access Token for the test user

3. **Use the Simple Instagram Graph API**:

   This project now uses the simplified Instagram API endpoint that works with basic access tokens:

   ```
   https://graph.instagram.com/me/media
   ```

4. **Optional - Convert to Long-Lived Token** (recommended for production):
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
   ```

### Legacy Instagram Business API

For advanced features, you can still use the Instagram Business API (requires the old server.js approach):

1. **Get Business Account ID**:

   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_ACCESS_TOKEN"
   ```

2. **Set Environment Variables**:
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_token
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_id
   ```

## 📧 Email Client Setup

### Gmail

1. Go to Gmail Settings → General → Signature
2. Click "Create new" signature
3. Paste the copied HTML
4. Save changes

### Outlook (Web)

1. Go to Settings → Mail → Compose and reply
2. Under Email signature, paste the HTML
3. Save

### Outlook (Desktop)

1. Go to File → Options → Mail → Signatures
2. Create new signature
3. Paste the HTML in the editor
4. Set as default

### Apple Mail

1. Go to Mail → Preferences → Signatures
2. Create new signature
3. Paste the HTML content
4. Save

## ⚙️ Configuration Options

### Environment Variables

| Variable          | Description                          | Default            |
| ----------------- | ------------------------------------ | ------------------ |
| `PORT`            | Server port (local development)      | `3000`             |
| `INSTAGRAM_TOKEN` | Your Instagram API access token      | Required           |
| `MAX_POSTS`       | Number of Instagram posts to display | `4`                |
| `THUMBNAIL_SIZE`  | Thumbnail size in pixels             | `80`               |
| `CACHE_DURATION`  | Cache duration in milliseconds       | `3600000` (1 hour) |

### Personal Information

| Variable            | Description        | Example             |
| ------------------- | ------------------ | ------------------- |
| `SIGNATURE_NAME`    | Your full name     | `John Doe`          |
| `SIGNATURE_TITLE`   | Your job title     | `Creative Director` |
| `SIGNATURE_COMPANY` | Your company name  | `ACME Corp`         |
| `SIGNATURE_EMAIL`   | Your email address | `john@acme.com`     |
| `SIGNATURE_PHONE`   | Your phone number  | `+1 (555) 123-4567` |
| `SIGNATURE_MOBILE`  | Your mobile number | `+1 (555) 987-6543` |
| `SIGNATURE_WEBSITE` | Your website URL   | `https://acme.com`  |

### Address Information

| Variable                        | Description     | Example           |
| ------------------------------- | --------------- | ----------------- |
| `SIGNATURE_ADDRESS_STREET`      | Street address  | `123 Main Street` |
| `SIGNATURE_ADDRESS_POSTAL_CODE` | Postal/ZIP code | `12345`           |
| `SIGNATURE_ADDRESS_CITY`        | City name       | `New York`        |
| `SIGNATURE_ADDRESS_COUNTRY`     | Country name    | `USA`             |

## 🔧 API Endpoints

### Serverless Functions (Production)

- `GET /api/instagram-posts` - Get Instagram posts with thumbnails
- `GET /api/signature-config` - Get signature configuration (includes address)
- `GET /api/debug` - Get debug information and environment status
- `GET /api/test-instagram` - Test Instagram API directly
- `GET /api/refresh-cache` - Force refresh Instagram cache

### Static Routes

- `GET /signature` - Main signature HTML page
- `GET /` - Homepage with project information

### Local Development

When running locally with `yarn dev`, all API endpoints are available through the main server.

## 📁 Project Structure

```
instagram-email-signature/
├── api/                   # Serverless API functions
│   ├── debug.js          # Debug endpoint
│   ├── instagram-posts.js # Instagram posts API
│   ├── refresh-cache.js  # Cache refresh endpoint
│   ├── signature-config.js # Signature configuration API
│   └── test-instagram.js # Instagram API testing
├── lib/                  # Shared utilities
│   ├── cache.js         # Caching logic for serverless
│   └── instagram.js     # Instagram API integration
├── public/              # Static files
│   ├── signature.html   # Main signature page
│   └── thumbnails/      # Generated thumbnail images (local)
├── index.js             # Main server (local development)
├── server.js            # Legacy monolithic server (reference)
├── package.json         # Dependencies and scripts
├── yarn.lock            # Yarn lockfile
├── vercel.json          # Vercel deployment configuration
├── .env                 # Environment configuration
└── README.md            # This documentation
```

## 🔄 How It Works

### Local Development

1. **Server Startup**: The `index.js` server starts and loads all API endpoints
2. **Instagram Integration**: Uses the simplified Instagram Graph API
3. **In-Memory Caching**: Posts and thumbnails are cached for better performance
4. **Signature Generation**: HTML signature is dynamically generated with current data

### Production (Serverless)

1. **Function Isolation**: Each API endpoint runs as an independent serverless function
2. **Auto-scaling**: Vercel automatically scales functions based on demand
3. **Smart Caching**: In-memory cache persists during warm function execution
4. **Fallback System**: Graceful fallback to mock data if Instagram API fails
5. **Optimized Performance**: Functions start quickly and handle requests efficiently

### Instagram Integration

- Uses the modern Instagram Graph API (`graph.instagram.com/me/media`)
- Supports both personal and business Instagram accounts
- Automatic thumbnail generation with 3:4 aspect ratio (optimal for email)
- Smart error handling with mock data fallback

## 🛠️ Customization

### Styling

Modify the CSS in `public/signature.html` to match your brand colors and fonts.

### Post Count

Change `MAX_POSTS` in your `.env` file or Vercel environment variables to display more or fewer Instagram posts.

### Address Format

The signature automatically formats your address based on the environment variables:

```
[Street]
[Postal Code] [City]
[Country]
```

### Cache Duration

For local development, modify the cache duration in your `.env` file:

```env
CACHE_DURATION=1800000  # 30 minutes
```

For serverless functions, caching is optimized automatically but resets on cold starts.

## 🐛 Troubleshooting

### Instagram API Issues

- **Token not found**: Ensure `INSTAGRAM_TOKEN` is set in your environment variables
- **API returns empty data**: Check that your Instagram account has public posts
- **Token expired**: Regenerate your Instagram access token (consider using long-lived tokens)
- **Rate limiting**: The app includes automatic fallback to mock data

### Vercel Deployment Issues

- **404 errors**: Check that `vercel.json` is properly configured
- **Function timeouts**: Vercel free plan has 10-second timeout limits
- **Environment variables**: Ensure all required variables are set in Vercel dashboard
- **Cold starts**: First request to a function may be slower

### Email Client Issues

- **Styles stripped**: Some email clients remove certain CSS styles
- **Images not displaying**: Ensure image URLs are accessible
- **Layout issues**: Test your signature in different email clients
- **HTML compatibility**: Consider using inline styles for better compatibility

### Local Development Issues

- **Port already in use**: Kill existing processes on port 3000 or change the PORT variable
- **Dependencies missing**: Run `yarn install` to install all dependencies
- **Environment variables**: Verify your `.env` file is properly configured
- **Cache issues**: Use `/api/refresh-cache` endpoint to force cache refresh

### Serverless Function Debugging

1. **Check Vercel logs**: View function logs in Vercel dashboard
2. **Use debug endpoint**: Visit `/api/debug` to check environment status
3. **Test Instagram API**: Use `/api/test-instagram` for direct API testing
4. **Memory cache**: Remember that cache resets on cold starts

## 🚀 Performance Optimization

### Serverless Benefits

- **Independent scaling**: Each function scales based on its own demand
- **Faster deployments**: Only changed functions are redeployed
- **Better error isolation**: One function failure doesn't affect others
- **Optimized cold starts**: Functions start quickly with minimal overhead

### Caching Strategy

- **Local development**: Persistent cache with configurable duration
- **Serverless production**: In-memory cache that persists during warm execution
- **Fallback system**: Mock data ensures signature always works
- **Smart invalidation**: Cache refreshes automatically when needed

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

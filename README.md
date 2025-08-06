# 📧 Dynamic Email Signature with Instagram Posts

A Node.js application that creates a dynamic email signature displaying your latest Instagram posts as thumbnail images below your contact information.

## ✨ Features

- **Dynamic Instagram Integration**: Automatically fetches and displays your latest Instagram posts
- **Responsive Design**: Email-compatible HTML that works across different email clients
- **Automatic Thumbnails**: Generates optimized thumbnail images for email signatures
- **Scheduled Updates**: Automatically refreshes Instagram posts every hour
- **Easy Configuration**: Simple environment-based configuration
- **Copy-Paste Ready**: Generates HTML that can be directly copied to email clients

## 🚀 Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Instagram API

1. Create a Facebook Developer account at [developers.facebook.com](https://developers.facebook.com)
2. Create a new app and enable Instagram Basic Display API
3. Get your Instagram Access Token (no Business Account ID needed with new method)
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
SIGNATURE_WEBSITE=https://yourwebsite.com
```

### 3. Start the Server

```bash
# Development mode with auto-restart
yarn dev

# Production mode
yarn start
```

### 4. Generate Your Signature

1. Open your browser to `http://localhost:3000/signature`
2. Customize your contact information in the `.env` file
3. Copy the generated HTML signature
4. Paste it into your email client's signature settings

## 📱 Instagram API Setup

### Getting Your Instagram Access Token

1. **Create Facebook App**:

   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create a new app
   - Add Instagram Basic Display product

2. **Get User Access Token**:

   - Use Facebook's Access Token Tool
   - Generate a User Access Token with `instagram_graph_user_media` permission

3. **Get Business Account ID**:

   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_ACCESS_TOKEN"
   ```

4. **Convert to Long-Lived Token** (recommended):
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
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

| Variable                        | Description                          | Default            |
| ------------------------------- | ------------------------------------ | ------------------ |
| `PORT`                          | Server port                          | `3000`             |
| `INSTAGRAM_ACCESS_TOKEN`        | Your Instagram API token             | Required           |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Your Instagram Business Account ID   | Required           |
| `MAX_POSTS`                     | Number of Instagram posts to display | `4`                |
| `THUMBNAIL_SIZE`                | Thumbnail size in pixels             | `80`               |
| `CACHE_DURATION`                | Cache duration in milliseconds       | `3600000` (1 hour) |

### Personal Information

Update these in your `.env` file:

- `SIGNATURE_NAME`: Your full name
- `SIGNATURE_TITLE`: Your job title
- `SIGNATURE_COMPANY`: Your company name
- `SIGNATURE_EMAIL`: Your email address
- `SIGNATURE_PHONE`: Your phone number
- `SIGNATURE_WEBSITE`: Your website URL

## 🔧 API Endpoints

- `GET /signature` - Main signature HTML page
- `GET /api/signature-config` - Get signature configuration
- `GET /api/instagram-posts` - Get Instagram posts with thumbnails
- `GET /thumbnails/:postId.jpg` - Serve thumbnail images

## 📁 Project Structure

```
instagram-email-signature/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── yarn.lock              # Yarn lockfile (commit this)
├── .env                   # Environment configuration
├── public/
│   ├── signature.html     # Main signature page
│   └── thumbnails/        # Generated thumbnail images
└── README.md              # This file
```

## 🔄 How It Works

1. **Server Startup**: The server starts and immediately fetches Instagram posts
2. **Thumbnail Generation**: Images are downloaded and resized to thumbnail size using Sharp
3. **Caching**: Posts and thumbnails are cached to reduce API calls
4. **Scheduled Updates**: A cron job updates the cache every hour
5. **Signature Generation**: The HTML signature is dynamically generated with current data
6. **Email Integration**: The signature HTML can be copied and used in any email client

## 🛠️ Customization

### Styling

Modify the CSS in `public/signature.html` to match your brand colors and fonts.

### Post Count

Change `MAX_POSTS` in your `.env` file to display more or fewer Instagram posts.

### Update Frequency

Modify the cron schedule in `server.js` to change how often posts are refreshed:

```javascript
// Update every 30 minutes
cron.schedule('*/30 * * * *', updateInstagramCache);

// Update every 6 hours
cron.schedule('0 */6 * * *', updateInstagramCache);
```

## 🐛 Troubleshooting

### Instagram API Issues

- Ensure your access token has the correct permissions
- Check that your Business Account ID is correct
- Verify your token hasn't expired (use long-lived tokens)

### Email Client Issues

- Some email clients strip certain CSS styles
- Test your signature in different email clients
- Consider using inline styles for better compatibility

### Server Issues

- Check that all dependencies are installed: `yarn install`
- Verify your `.env` file is properly configured
- Check server logs for specific error messages

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

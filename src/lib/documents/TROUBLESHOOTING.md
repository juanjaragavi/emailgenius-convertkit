# EmailGenius ConvertKIT - Troubleshooting Guide

## Common Issues and Solutions

### 1. "fetch failed sending request" Error

**Problem**: The application cannot connect to the Gemini API.

**Possible Causes & Solutions**:

#### A. Missing or Invalid API Key

- **Check if API key is set**: Visit `/api/health` in your browser
- **Get an API key**: Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Set the API key**: Add to `.env.local` file:
  `env
      GEMINI_API_KEY=your_actual_api_key_here
      `
- **Restart the server**: After adding the API key, restart with `npm run dev`

#### B. Network Connectivity Issues

- **Check internet connection**: Ensure you have a stable internet connection
- **Corporate firewall**: If behind a corporate firewall, you may need to configure proxy settings
- **VPN issues**: Try disabling VPN if you're using one

#### C. API Quota Exceeded

- **Check Google Cloud Console**: Visit [Google Cloud Console](https://console.cloud.google.com/)
- **Monitor usage**: Check your API usage and quotas
- **Upgrade plan**: Consider upgrading if you've hit free tier limits

### 2. "Failed to generate content" Error

**Problem**: The AI model fails to generate content.

**Solutions**:

- **Check URL format**: Ensure the URL is valid and accessible
- **Try different URLs**: Some URLs might be blocked or inaccessible
- **Check API key permissions**: Ensure your API key has the right permissions

### 3. Environment Variables Not Working

**Problem**: Environment variables are not being read correctly.

**Solutions**:

- **File location**: Ensure `.env.local` is in the root directory (same level as `package.json`)
- **File format**: Use the exact format: `GEMINI_API_KEY=your_key_here` (no spaces around =)
- **Restart required**: Always restart the development server after changing environment variables
- **Check loading**: Add `console.log(process.env.GEMINI_API_KEY)` to verify it's loaded

### 4. Development Server Issues

**Problem**: The application doesn't start or crashes.

**Solutions**:

- **Clean install**: Delete `node_modules` and run `npm install` again
- **Check Node.js version**: Ensure you have Node.js 18+ installed
- **Clear cache**: Run `npm run build` to clear any build cache
- **Check ports**: Ensure port 3000 is available

### 5. Debugging Steps

1. **Check API health**: Visit `http://localhost:3010/api/health`
2. **Check console logs**: Open browser developer tools and check the console
3. **Check server logs**: Look at the terminal where you ran `npm run dev`
4. **Test with simple URL**: Try a basic URL like `https://example.com`

### 6. API Key Setup (Step-by-Step)

1. **Go to Google AI Studio**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. **Sign in**: Use your Google account
3. **Create API Key**: Click "Create API Key"
4. **Copy the key**: Copy the generated key (starts with "AIza...")
5. **Create .env.local**: Create a file named `.env.local` in your project root
6. **Add the key**: Add this line to the file:
   `env
    GEMINI_API_KEY=AIza...your_actual_key_here
    `
7. **Restart server**: Stop the development server (Ctrl+C) and restart with `npm run dev`

### 7. Testing Your Setup

Run these commands to test your setup:

```bash
# Test API health
curl http://localhost:3010/api/health

# Test basic functionality
curl -X POST http://localhost:3010/api/generate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 8. Still Having Issues?

If you're still experiencing problems:

1. **Check the GitHub Issues**: Look for similar problems in the repository
2. **Create a detailed bug report**: Include:
   - Your operating system
   - Node.js version (`node --version`)
   - Error messages (full stack trace)
   - Steps to reproduce
   - Screenshot if applicable

### 9. Performance Tips

- **Use valid URLs**: Ensure URLs are accessible and not behind authentication
- **Stable internet**: Use a stable internet connection for best results
- **Monitor usage**: Keep track of your API usage to avoid hitting quotas
- **Test during off-peak hours**: API might be faster during off-peak times

### 10. Environment Variables Reference

Create a `.env.local` file with these variables:

```bash
# Required: Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: App URL for production
NEXT_PUBLIC_APP_URL=http://localhost:3010
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

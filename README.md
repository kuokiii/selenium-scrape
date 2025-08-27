# Advanced Web Scraper

A powerful web scraper built with Next.js and Selenium that can bypass anti-bot measures and extract comprehensive data from any website.

## Features

- 🚀 **Advanced Anti-Detection**: Bypasses modern anti-bot systems including Cloudflare, reCAPTCHA, and more
- 🎯 **Comprehensive Extraction**: Extracts text, images, links, tables, forms, metadata, and structured data
- 🖼️ **Image Download**: Automatically downloads and processes images from scraped websites
- 📊 **Rich Data Export**: Export results in JSON, CSV, or plain text formats
- 🔒 **Stealth Mode**: Human-like behavior simulation and browser fingerprint spoofing
- 🌐 **Universal Compatibility**: Works with any website including complex SPAs and protected sites

## Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Manual Railway Deployment

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd selenium-web-scraper
   \`\`\`

2. **Deploy to Railway**
   \`\`\`bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Deploy the project
   railway up
   \`\`\`

3. **Set Environment Variables** (Optional)
   \`\`\`bash
   # For proxy support (optional)
   railway variables set PROXY_URL=your-proxy-url
   
   # For custom Chrome path (usually not needed)
   railway variables set CHROME_BIN=/usr/bin/chromium-browser
   \`\`\`

## Local Development

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Install Chrome/Chromium**
   \`\`\`bash
   # On macOS
   brew install chromium
   
   # On Ubuntu/Debian
   sudo apt-get install chromium-browser
   
   # On Windows
   # Download and install Chrome from https://www.google.com/chrome/
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a URL** in the input field
2. **Configure extraction options**:
   - Extract Text: Get all text content from the page
   - Extract Images: Download and catalog all images
   - Extract Links: Collect all links with metadata
   - Bypass Anti-Bot: Enable advanced anti-detection measures
3. **Advanced settings**:
   - Wait Time: Delay before extraction (ms)
   - Scroll to Bottom: Automatically scroll to load dynamic content
   - Human Behavior: Simulate human-like interactions
   - Stealth Mode: Maximum anti-detection measures
4. **Click "Scrape"** and wait for results
5. **View results** in organized tabs:
   - **Content**: Text content and headings
   - **Images**: Image gallery with download status
   - **Links**: All links categorized by type
   - **Structure**: Tables, lists, and forms
   - **Contact**: Email addresses, phone numbers, addresses
   - **Technical**: Metadata and structured data
6. **Export data** in JSON, CSV, or TXT format

## API Usage

### Scrape Endpoint

\`\`\`bash
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com",
  "config": {
    "extractText": true,
    "extractImages": true,
    "extractLinks": true,
    "bypassAntiBot": true,
    "waitTime": 3000,
    "scrollToBottom": true,
    "humanBehavior": true,
    "stealthMode": true
  }
}
\`\`\`

### Health Check

\`\`\`bash
GET /api/health
\`\`\`

## Supported Websites

This scraper can handle:
- ✅ **G2 Insights** and other review platforms
- ✅ **E-commerce sites** (Amazon, eBay, etc.)
- ✅ **Social media platforms** (public content)
- ✅ **News websites** and blogs
- ✅ **Business directories** and listings
- ✅ **Documentation sites** and wikis
- ✅ **SPA applications** with dynamic content
- ✅ **Sites with CAPTCHA** (with manual intervention)
- ✅ **Cloudflare-protected sites**

## Anti-Detection Features

- **Browser Fingerprint Spoofing**: Randomized user agents, screen resolutions, and browser properties
- **Human Behavior Simulation**: Random mouse movements, scrolling patterns, and timing
- **Request Header Manipulation**: Realistic browser headers and connection patterns
- **CAPTCHA Detection**: Automatic detection with pause for manual solving
- **Rate Limiting**: Intelligent delays to avoid triggering anti-bot systems
- **Proxy Support**: Optional proxy rotation for additional anonymity

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `CHROME_BIN` | Chrome executable path | `/usr/bin/chromium-browser` |
| `PUPPETEER_EXECUTABLE_PATH` | Puppeteer Chrome path | `/usr/bin/chromium-browser` |
| `PROXY_URL` | Optional proxy URL | - |

## Troubleshooting

### Common Issues

1. **Chrome not found**
   - Ensure Chrome/Chromium is installed
   - Check `CHROME_BIN` environment variable

2. **Memory issues on Railway**
   - The app is optimized for Railway's memory limits
   - Large pages may require more processing time

3. **CAPTCHA blocking**
   - Enable "Human Behavior" and "Stealth Mode"
   - Some sites may require manual CAPTCHA solving

4. **Rate limiting**
   - Increase wait time in advanced settings
   - Enable human behavior simulation

### Performance Tips

- Use "Scroll to Bottom" for dynamic content
- Enable "Human Behavior" for better success rates
- Adjust wait time based on site complexity
- Use proxy rotation for high-volume scraping

## Legal Notice

This tool is for educational and legitimate research purposes only. Always:
- Respect robots.txt files
- Follow website terms of service
- Don't overload servers with requests
- Obtain permission for commercial use
- Comply with applicable laws and regulations

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Railway deployment logs
3. Open an issue on GitHub

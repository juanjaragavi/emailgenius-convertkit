# EmailGenius ConvertKIT 🚀

## AI-Powered Email Marketing Campaign Generator for ConvertKIT

EmailGenius ConvertKIT is an intelligent email marketing tool that leverages Google's Gemini AI to create high-engagement, click-through-optimized email campaigns specifically designed for the ConvertKIT platform. Transform any URL into compelling email broadcasts that mimic transactional communications to maximize open rates and conversions.

## ✨ Key Features

- **AI-Powered Content Generation**: Uses Google Gemini AI to analyze URLs and create compelling email campaigns
- **ConvertKIT Integration**: Optimized for seamless integration with ConvertKIT's Markdown processor
- **A/B Test Ready**: Generates multiple subject lines for optimal performance testing
- **Bilingual Support**: Supports both English (US) and Spanish (Mexico) markets
- **Real-time Streaming**: Live content generation with progress updates
- **Markdown Validation**: Built-in validation to ensure proper formatting
- **One-Click Copy**: Easy clipboard integration with ConvertKIT formatting guidance
- **Mobile-Optimized**: Responsive design for all devices

## 🎯 What It Does

EmailGenius ConvertKIT transforms product URLs into high-converting email campaigns by:

1. **Analyzing** the provided URL content
2. **Generating** compelling subject lines with A/B testing variants
3. **Creating** urgency-driven email bodies that feel like official notifications
4. **Optimizing** for ConvertKIT's Markdown formatting
5. **Providing** detailed image concepts for visual enhancement
6. **Ensuring** proper personalization with ConvertKIT variables

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.1 with App Router
- **Frontend**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **AI Integration**: Google Gemini AI (@google/genai)
- **Streaming**: Server-Sent Events (SSE)
- **Development**: Turbopack for fast development

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Google Gemini AI API key

### Installation

1. Clone the repository:
        ```bash
            git clone https://github.com/yourusername/emailgenius-convertkit.git
            cd emailgenius-convertkit
        ```

2. Install dependencies:
        ```bash
            npm install
            # or
            yarn install
            # or
            pnpm install
        ```

3. Set up environment variables:
        ```bash
        cp .env.example .env.local
        ```
Add your Google Gemini AI API key to `.env.local`:
        ```env
        GEMINI_API_KEY=your_gemini_api_key_here
        ```

4. Run the development server:
        ```bash
        npm run dev
        # or
        yarn dev
        # or
        pnpm dev
        ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser
        ```bash
        npm run dev
        # or
        yarn dev
        # or
        pnpm dev
        ```

## 📝 Usage

1. **Enter a URL**: Paste any financial product or service URL
2. **Generate Campaign**: Click "Generate Email Campaign" and watch the AI create your content
3. **Review Output**: The system generates:
   - Two A/B test subject lines
   - Optimized preview text
   - Compelling email body with personalization
   - Professional signature
   - Call-to-action button text
   - Detailed image concept
4. **Copy to ConvertKIT**: Use the copy button and paste directly into ConvertKIT
5. **Format in ConvertKIT**: When prompted, click "Yes, format" to preserve Markdown

## 🎨 Campaign Strategies

EmailGenius rotates between different proven strategies:

- **Fulfillment Notifications**: Shipping and delivery updates
- **Security Alerts**: Account verification and security updates
- **Exclusive Invitations**: Beta access and special offers
- **Status Updates**: Account and application confirmations

## 🔧 Project Structure

```markdown
src/
├── app/
│   ├── page.tsx              # Main application interface
│   ├── layout.tsx            # App layout and metadata
│   ├── globals.css           # Global styles
│   └── api/
│       └── generate/
│           └── route.ts      # API endpoint for content generation
├── lib/
│   ├── gemini.ts            # Google Gemini AI service
│   ├── documents/           # Project documentation
│   └── tests/               # Test files
└── public/                  # Static assets
```

## 🌟 Core Components

### Gemini AI Service

- Handles AI model initialization and communication
- Manages conversation history for context
- Implements streaming responses for real-time generation

### Frontend Interface

- Real-time progress updates during generation
- Markdown validation and formatting
- Clipboard integration with user guidance
- Responsive design for all devices

### API Integration

- Server-Sent Events for streaming responses
- Error handling and recovery
- Secure API key management

## 📊 Features in Detail

### Markdown Validation

- Validates bold text markers
- Checks bullet point formatting
- Ensures ConvertKIT variable syntax
- Provides real-time feedback

### ConvertKIT Integration

- Uses proper `{{ subscriber.first_name }}` syntax
- Optimized for ConvertKIT's Markdown processor
- Includes formatting guidance for users
- Maintains proper paragraph spacing

### Bilingual Support

- Automatic language detection based on URL
- Cultural adaptation for US and Mexico markets
- Localized content strategies

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Other Platforms

```bash
npm run build
npm start
```

## 📈 Performance Features

- **Turbopack**: Lightning-fast development builds
- **Streaming**: Real-time content generation
- **Optimized Images**: Mobile-first image concepts
- **Caching**: Efficient API response handling

## 🔐 Security & Privacy

- API keys stored securely in environment variables
- No user data stored or logged
- Secure communication with Google Gemini AI
- Content validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful content generation
- ConvertKIT for excellent email marketing platform
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling

## 📞 Support

For support, questions, or feature requests:

- **Common Issues**: Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide
- **API Health Check**: Visit `/api/health` when running locally
- **GitHub Issues**: Open an issue in the repository
- **Documentation**: Review the comprehensive setup guide above

## 🚨 Quick Troubleshooting

If you're getting errors:

1. **Check your API key**: Visit `http://localhost:3000/api/health`
2. **Verify environment**: Ensure `.env.local` has your `GEMINI_API_KEY`
3. **Restart server**: Stop and restart with `npm run dev`
4. **Check console**: Look for detailed error messages in browser/terminal

---

## **Built with ❤️ by the TopNetworks team**

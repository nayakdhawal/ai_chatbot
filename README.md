# Futuristic AI Chatbot

A modern, production-ready AI chatbot built with Next.js 14, TypeScript, and Tailwind CSS. Features a sleek futuristic UI with real-time messaging, error handling, and n8n webhook integration.

## 🚀 Features

- **Modern UI**: Futuristic dark theme with smooth animations
- **Real-time Chat**: Instant messaging with typing indicators
- **Error Handling**: Comprehensive error recovery and retry functionality
- **Rate Limiting**: Built-in protection against API abuse
- **Security**: Security headers, input validation, and CORS protection
- **Production Ready**: Health checks, structured logging, and monitoring
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA labels and screen reader support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- n8n instance with webhook endpoint

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd futuristic-chatbot
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Required
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Optional
NODE_ENV=development
```

### 3. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Production Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `N8N_WEBHOOK_URL`: Your n8n webhook URL
   - `NODE_ENV`: `production`
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app includes:
- `vercel.json` for Vercel configuration
- `middleware.ts` for security headers
- Health check endpoint at `/api/health`

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `N8N_WEBHOOK_URL` | Yes | Your n8n webhook endpoint URL |
| `NODE_ENV` | No | Environment (development/production) |

### n8n Webhook Setup

Your n8n webhook should:
1. Accept POST requests with JSON body
2. Expect `{ message: string, timestamp: string }`
3. Return JSON with `{ response: string }` or plain text

Example n8n webhook response:
```json
{
  "response": "Hello! How can I help you today?"
}
```

## 🛡️ Security Features

- **Rate Limiting**: 10 requests per minute per IP
- **Input Validation**: Message length and type validation
- **Security Headers**: X-Frame-Options, CSP, etc.
- **CORS Protection**: Configured for API routes
- **Error Handling**: No sensitive data in error messages

## 📊 Monitoring

- **Health Check**: `/api/health` endpoint
- **Structured Logging**: JSON-formatted logs
- **Error Tracking**: Comprehensive error logging
- **Performance**: Built-in analytics support

## 🎨 Customization

### Styling
- Modify `app/globals.css` for theme changes
- Update color variables in CSS custom properties
- Customize animations in the CSS file

### Components
- Chat interface: `components/chat-interface.tsx`
- UI components: `components/ui/`
- Error pages: `app/error.tsx`, `app/not-found.tsx`

## 🐛 Troubleshooting

### Common Issues

1. **"Server configuration error"**
   - Check that `N8N_WEBHOOK_URL` is set correctly
   - Verify your n8n webhook is accessible

2. **"Too many requests"**
   - Rate limiting is working (10 requests/minute)
   - Wait or implement user authentication

3. **Empty responses**
   - Check n8n workflow configuration
   - Verify webhook returns proper JSON format

### Debug Mode

Set `NODE_ENV=development` for detailed logging.

## 📝 API Reference

### POST `/api/chat`

Send a message to the AI chatbot.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you for asking!"
}
```

### GET `/api/health`

Check application health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "services": {
    "n8n": "configured"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Open an issue on GitHub

---

Built with ❤️ using Next.js and modern web technologies.

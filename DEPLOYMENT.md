# 🚀 Production Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Create `.env.local` for local development:
```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
NODE_ENV=development
```

### 2. n8n Webhook Configuration
Ensure your n8n webhook:
- ✅ Accepts POST requests
- ✅ Expects JSON: `{ message: string, timestamp: string }`
- ✅ Returns JSON: `{ response: string }` or plain text
- ✅ Is accessible from your deployment platform

## Vercel Deployment

### 1. Connect Repository
- [ ] Push code to GitHub/GitLab
- [ ] Connect repository to Vercel
- [ ] Select the correct branch (usually `main`)

### 2. Environment Variables
Set in Vercel dashboard:
- [ ] `N8N_WEBHOOK_URL` = your n8n webhook URL
- [ ] `NODE_ENV` = `production`

### 3. Deploy
- [ ] Trigger deployment
- [ ] Check build logs for errors
- [ ] Verify deployment URL works

## Post-Deployment Verification

### 1. Health Check
- [ ] Visit `https://your-app.vercel.app/api/health`
- [ ] Verify status is "healthy"
- [ ] Check n8n service shows "configured"

### 2. Chat Functionality
- [ ] Send a test message
- [ ] Verify response is received
- [ ] Check error handling works
- [ ] Test rate limiting (send 11+ requests quickly)

### 3. Security
- [ ] Check security headers are present
- [ ] Verify CORS is working
- [ ] Test input validation (empty message, long message)

### 4. Error Pages
- [ ] Visit non-existent page (404)
- [ ] Trigger an error (500)
- [ ] Verify custom error pages display

## Monitoring Setup

### 1. Logs
- [ ] Check Vercel function logs
- [ ] Verify structured logging is working
- [ ] Set up log aggregation if needed

### 2. Analytics
- [ ] Vercel Analytics is already included
- [ ] Consider adding Sentry for error tracking
- [ ] Set up uptime monitoring

### 3. Performance
- [ ] Check Core Web Vitals
- [ ] Monitor API response times
- [ ] Set up alerts for failures

## Security Checklist

- [ ] Rate limiting is active (10 req/min)
- [ ] Input validation is working
- [ ] Security headers are present
- [ ] No sensitive data in logs
- [ ] CORS is properly configured
- [ ] HTTPS is enforced

## Troubleshooting

### Common Issues

1. **"Server configuration error"**
   - Check `N8N_WEBHOOK_URL` is set correctly
   - Verify webhook URL is accessible

2. **"Too many requests"**
   - Rate limiting is working (expected behavior)
   - Consider implementing user authentication

3. **Empty responses**
   - Check n8n workflow configuration
   - Verify webhook returns proper format

4. **Build failures**
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Check environment variables

### Debug Steps

1. Check Vercel function logs
2. Test webhook URL directly
3. Verify environment variables
4. Check n8n workflow status

## Maintenance

### Regular Tasks
- [ ] Monitor error rates
- [ ] Check webhook uptime
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Backup configuration

### Scaling Considerations
- [ ] Implement Redis for rate limiting
- [ ] Add database for chat history
- [ ] Consider CDN for static assets
- [ ] Set up load balancing if needed

---

✅ **Your chatbot is now production-ready!**

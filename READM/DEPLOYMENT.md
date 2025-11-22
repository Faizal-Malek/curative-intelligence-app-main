# 🚀 Production Deployment Guide

## Overview

This guide covers the complete production deployment process for the Curative Intelligence social media analytics application. The application has been upgraded to production-level standards with comprehensive error handling, security, performance optimization, and monitoring.

## 📋 Pre-deployment Checklist

### 1. Environment Configuration
- [ ] Set all required environment variables
- [ ] Configure database connections (production)
- [ ] Set up Supabase authentication
- [ ] Configure external API keys (social media platforms)
- [ ] Set up monitoring and logging services

### 2. Security Verification
- [ ] Review CSRF protection settings
- [ ] Verify input sanitization is active
- [ ] Check rate limiting configuration
- [ ] Ensure HTTPS is enforced
- [ ] Review security headers configuration

### 3. Performance Validation
- [ ] Run performance tests
- [ ] Verify bundle optimization
- [ ] Test Core Web Vitals
- [ ] Validate caching strategies
- [ ] Check lazy loading implementation

### 4. Testing Completion
- [ ] Run full test suite (`npm run test`)
- [ ] Verify coverage thresholds (75%+)
- [ ] Conduct integration tests
- [ ] Perform security testing
- [ ] Test error scenarios

## 🌐 Environment Variables

### Required Production Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Social Media APIs
INSTAGRAM_APP_ID="your-instagram-app-id"
INSTAGRAM_APP_SECRET="your-instagram-app-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
TWITTER_API_KEY="your-twitter-api-key"
TWITTER_API_SECRET="your-twitter-api-secret"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"

# Security
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Monitoring (Optional)
SENTRY_DSN="your-sentry-dsn"
POSTHOG_KEY="your-posthog-key"
```

## 🏗️ Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all required variables for production

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t curative-intelligence .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-database-url" \
     -e NEXT_PUBLIC_SUPABASE_URL="your-supabase-url" \
     # ... other env vars
     curative-intelligence
   ```

### Option 3: Traditional Server

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## 🗄️ Database Setup

### 1. Run Migrations
```bash
# Development
npm run db:migrate:dev

# Production
npm run db:migrate:deploy
```

### 2. Seed Data (Optional)
```bash
npm run db:seed
```

### 3. Verify Schema
```bash
npm run db:studio
```

## 🔧 Production Configuration

### Next.js Optimizations
The application includes:
- Bundle optimization and code splitting
- Image optimization with WebP/AVIF formats
- Automatic static optimization
- Optimized CSS and JavaScript minification
- Security headers configuration

### Security Features
- CSRF protection
- Input sanitization
- Rate limiting
- IP blocking capabilities
- Security headers (HSTS, CSP, etc.)
- Authentication middleware

### Performance Features
- Advanced caching strategies
- Lazy loading components
- Core Web Vitals monitoring
- Database query optimization
- API response caching

## 📊 Monitoring & Logging

### Health Checks
- Endpoint: `/api/health`
- Monitors: Database, Supabase, External APIs
- Response format: JSON with service status

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking and alerting
- Performance monitoring

### Analytics
- Core Web Vitals tracking
- User interaction analytics
- Error rate monitoring
- API performance metrics

## 🔍 Testing

### Run Tests
```bash
# Unit tests
npm run test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage Requirements
- Minimum 75% coverage across all metrics
- Critical paths: 90%+ coverage
- API routes: 85%+ coverage
- Components: 80%+ coverage

## 🚨 Error Handling

### Error Monitoring
- Centralized error handling system
- Custom error types for different scenarios
- Automatic error reporting
- User-friendly error messages

### Error Recovery
- Graceful degradation
- Fallback UI components
- Retry mechanisms for failed requests
- Offline support (where applicable)

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Production Deploy
on:
  push:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: vercel --prod
```

## 📈 Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
ANALYZE=true npm run build
```

### Performance Testing
- Lighthouse CI integration
- Core Web Vitals monitoring
- Load testing with k6 or Artillery
- Database query performance analysis

## 🔐 Security Best Practices

### Code Security
- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens
- Secure session management

### Infrastructure Security
- HTTPS enforcement
- Security headers
- Rate limiting
- IP whitelisting (if needed)
- Regular security audits

## 📝 Post-Deployment

### 1. Verify Deployment
- [ ] Health check endpoint responds correctly
- [ ] All features work as expected
- [ ] Authentication flows function properly
- [ ] Social media integrations work
- [ ] Database connections are stable

### 2. Monitor Initial Performance
- [ ] Check error rates
- [ ] Monitor response times
- [ ] Verify cache hit rates
- [ ] Check database performance
- [ ] Monitor Core Web Vitals

### 3. User Acceptance Testing
- [ ] Test all user flows
- [ ] Verify responsive design
- [ ] Check accessibility compliance
- [ ] Test error scenarios
- [ ] Validate data integrity

## 🆘 Troubleshooting

### Common Issues

**Build Failures**
- Check environment variables
- Verify database connection
- Review dependency versions

**Performance Issues**
- Check bundle size analysis
- Review database queries
- Verify caching configuration

**Authentication Problems**
- Verify Supabase configuration
- Check JWT token validity
- Review CORS settings

### Support Resources
- Application logs: `/api/health`
- Monitoring dashboard: Configure based on your provider
- Error tracking: Integrated with monitoring system

## 📞 Support

For deployment issues or questions:
1. Check application logs
2. Review error monitoring dashboards
3. Consult this deployment guide
4. Check project documentation

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Environment**: Production-Ready
# 🎯 Curative Intelligence - Production-Ready Social Media Analytics

A comprehensive, production-level social media analytics and content management platform built with Next.js 15, featuring advanced error handling, security, performance optimization, and comprehensive testing.

## ?? API Documentation

### Core Endpoints
- `GET /api/health` - Health check and service status
- `GET /api/dashboard/stats` - Dashboard analytics
- `POST /api/content/generate-batch` - Content generation
- `POST /api/onboarding/profile` - User profile setup

### API Features
- **Middleware**: Authentication, validation, rate limiting
- **Error Handling**: Structured error responses
- **Caching**: Response caching for performance
- **Monitoring**: Request/response logging

## 🛡️ Security

### Implemented Security Measures
- **Input Sanitization**: XSS prevention
- **SQL Injection Protection**: Parameterized queries via Prisma
- **Rate Limiting**: Per-IP request limits
- **CSRF Protection**: Token-based protection
- **Security Headers**: HSTS, CSP, X-Frame-Options

### Environment Security
- **Secret Management**: Environment-based configuration
- **API Key Protection**: Secure storage and rotation
- **Database Security**: Connection encryption and access controls

## 📈 Performance Monitoring

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: Optimized with image preloading
- **FID (First Input Delay)**: Minimized with code splitting
- **CLS (Cumulative Layout Shift)**: Prevented with skeleton loading

### Bundle Optimization
```bash
# Analyze bundle size
ANALYZE=true npm run build
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript strict mode
- Maintain 75%+ test coverage
- Use conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- **Health Checks**: Monitor `/api/health` endpoint
- **Logs**: Structured logging available in production
- **Issues**: Create GitHub issues for bug reports

## 🔮 Roadmap

- [ ] Real-time analytics with WebSocket integration
- [ ] Advanced AI content optimization
- [ ] Multi-tenant support for agencies
- [ ] Mobile app with React Native
- [ ] Advanced reporting and export features

---

**Version**: 1.0.0 (Production Ready)  
**Last Updated**: December 2024  
**Maintainer**: Development Team

## Analytics & Integrations

This project includes a lightweight Analytics Dashboard skeleton and a secure n8n integration webhook stub.

- Analytics page: available at `/analytics` (server component). It uses `src/lib/analytics.ts` for mock data and `src/components/ui/AnimatedCard.tsx` for animated metric cards. The UI follows the project's Tailwind theme and includes 3D hover effects and accessible markup.

- n8n integration: a webhook endpoint is available at `/api/integrations/n8n`. The route verifies a secret header and echoes a minimal summary. See `src/lib/integrations/n8n.ts` for the verification helper and processing stub.

Environment variables:

- `N8N_WEBHOOK_SECRET` - shared secret that n8n should send as the `x-n8n-webhook-secret` header. If not set, the endpoint will reject webhooks.

How to test locally:

1. Ensure dev server is running: `npm run dev`.
2. Set `N8N_WEBHOOK_SECRET` in your local environment (do NOT commit secrets to git).
3. Send a POST to `http://localhost:3000/api/integrations/n8n` with the `x-n8n-webhook-secret` header set to the secret and a JSON body. The endpoint will return a minimal acknowledgement.

Future work:

- Wire the n8n payload to the app's job queue (Redis) to process asynchronously.
- Replace mock analytics with real metrics from the database and add charts with a small charting library (kept off by default to avoid heavy bundle sizes).

## Supabase / Postgres (Supabase-first setup)

This project now uses Supabase Postgres exclusively. Configure your environment with your Supabase connection strings and run Prisma to push the schema:

```bash
npx prisma db push
# or use migrations
to create migrations: npx prisma migrate dev --name init
```

# CAG Secure Backend

A comprehensive, enterprise-grade secure backend for the Cleared Advisory Group platform, implementing military-grade security standards suitable for handling cleared professional data.

## 🛡️ Security Features

### ✅ **Implemented Security Stack**

1. **HTTPS Enforcement**
   - Automatic HTTP to HTTPS redirects
   - HSTS headers for enhanced security
   - Proxy-aware configuration for Vercel deployment

2. **Authentication & Authorization**
   - JWT-based authentication with HTTP-only cookies
   - Role-based access control (RBAC)
   - Multi-factor authentication ready
   - Secure password hashing with bcrypt (12 rounds)

3. **Input Security**
   - Comprehensive PII detection and blocking
   - Input sanitization with express-validator
   - SQL injection prevention
   - XSS protection

4. **Rate Limiting & Brute Force Protection**
   - Global rate limiting (100 req/15min)
   - Auth rate limiting (5 attempts/15min)
   - Progressive delays for repeated failures
   - Role-based rate limiting

5. **Data Protection**
   - Field-level encryption for sensitive data
   - Secure file upload with virus scanning
   - Database query parameterization
   - Encrypted backups with compression

6. **Monitoring & Logging**
   - Comprehensive security event logging
   - Request/response logging with Morgan
   - Failed authentication tracking
   - Performance monitoring

## 📁 Project Structure

```
backend/
├── src/
│   ├── middleware/          # Security middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── cors.js         # CORS configuration
│   │   ├── https.js        # HTTPS enforcement
│   │   ├── rateLimiter.js  # Rate limiting
│   │   ├── piiFilter.js    # PII detection
│   │   └── roleAuth.js     # Role-based access
│   ├── routes/             # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── resume.js       # Resume management
│   │   ├── jobs.js         # Job board API
│   │   └── admin.js        # Admin functions
│   ├── utils/              # Utility functions
│   │   ├── encryption.js   # Encryption utilities
│   │   ├── validation.js   # Input validation
│   │   └── logger.js       # Logging configuration
│   ├── config/             # Configuration files
│   │   ├── security.js     # Security constants
│   │   └── database.js     # Database config
│   └── app.js              # Main application
├── prisma/                 # Database schema
├── tests/                  # Security tests
├── logs/                   # Application logs
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your secure values
```

3. **Initialize database:**
```bash
npm run db:migrate
npm run db:generate
```

4. **Start development server:**
```bash
npm run dev
```

### Production Deployment

1. **Build and deploy:**
```bash
npm run build
npm start
```

2. **Verify security:**
```bash
curl https://your-api.com/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT secret key | `your-32-char-secret` |
| `DATABASE_URL` | Database connection | `postgresql://...` |
| `FRONTEND_URL` | Frontend URL | `https://caglive2.vercel.app` |

### Security Configuration

The `src/config/security.js` file contains all security constants:

- Password requirements (12+ chars, complexity)
- Rate limiting thresholds
- PII detection patterns
- Role permissions
- Encryption settings

## 🔐 Security Standards Compliance

### ✅ **OWASP Top 10 (2021)**
- [x] A01:2021 - Broken Access Control
- [x] A02:2021 - Cryptographic Failures
- [x] A03:2021 - Injection
- [x] A04:2021 - Insecure Design
- [x] A05:2021 - Security Misconfiguration
- [x] A06:2021 - Vulnerable Components
- [x] A07:2021 - Identity/Auth Failures
- [x] A08:2021 - Software/Data Integrity
- [x] A09:2021 - Security Logging/Monitoring
- [x] A10:2021 - Server-Side Request Forgery

### ✅ **Government Standards**
- NIST Cybersecurity Framework
- FedRAMP security controls
- FISMA compliance ready
- SOC 2 Type II preparation

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login       # User login
POST   /api/auth/register    # User registration
POST   /api/auth/logout      # Secure logout
GET    /api/auth/profile     # User profile
POST   /api/auth/refresh     # Token refresh
```

### Resume Management
```
POST   /api/resume/upload    # Upload resume
GET    /api/resume/download  # Download resume
POST   /api/resume/analyze   # AI analysis
DELETE /api/resume/:id       # Delete resume
```

### Job Board
```
GET    /api/jobs            # List jobs
GET    /api/jobs/:id        # Job details
POST   /api/jobs/apply      # Apply to job
GET    /api/jobs/applied    # User applications
```

### Admin (Role-Protected)
```
GET    /api/admin/users     # User management
POST   /api/admin/backup    # Create backup
GET    /api/admin/logs      # Security logs
DELETE /api/admin/user/:id  # Delete user
```

## 🧪 Testing

### Security Tests
```bash
npm test                    # Run all tests
npm run test:security      # Security-specific tests
npm run test:auth          # Authentication tests
npm run test:pii           # PII detection tests
```

### Manual Security Testing
```bash
# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:5000/api/auth/login; done

# Test PII detection
curl -X POST http://localhost:5000/api/test -d '{"ssn":"123-45-6789"}'

# Test HTTPS enforcement
curl -I http://localhost:5000/health
```

## 📋 Monitoring & Alerts

### Security Events Logged
- Failed authentication attempts
- Rate limit violations
- PII detection events
- Unauthorized access attempts
- Database connection issues

### Health Monitoring
```bash
# Check application health
curl https://your-api.com/health

# Monitor logs
tail -f logs/security.log
tail -f logs/application.log
```

## 🔄 Backup & Recovery

### Automated Backups
- Daily encrypted database backups
- 30-day retention policy
- Cloud storage integration (AWS S3)
- Backup verification and integrity checks

### Manual Backup
```bash
npm run backup              # Create manual backup
npm run backup:restore      # Restore from backup
```

## 🚨 Security Incident Response

### Immediate Actions
1. Check security logs: `logs/security.log`
2. Review failed authentication attempts
3. Monitor rate limiting violations
4. Verify database integrity

### Alert Thresholds
- 10+ failed logins from same IP
- 5+ suspicious activities
- Database connection failures
- Unusual API usage patterns

## 🔗 Integration with Frontend

### Next.js Integration
```javascript
// Frontend API calls with secure cookies
const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Include HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ email, password })
});
```

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add JWT_SECRET
vercel env add DATABASE_URL
```

## 📚 Additional Resources

- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

## 🤝 Contributing

1. Follow security coding standards
2. Include security tests for new features
3. Update documentation for security changes
4. Review OWASP guidelines before submission

## 📞 Support

For security issues or questions:
- Email: security@clearedadvisorygroup.com
- Emergency: Follow incident response procedures
- Documentation: See `/docs` directory

---

**⚠️ Security Notice**: This backend implements enterprise-grade security suitable for government contractors and cleared professionals. Ensure all environment variables are properly secured and never commit secrets to version control.
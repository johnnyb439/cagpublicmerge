# Security Architecture - Cleared Advisory Group

## Overview
This document outlines the security architecture and implementation for the Cleared Advisory Group website, designed to handle sensitive clearance-related data with enterprise-grade security.

## 1. Database Security (Supabase)

### Configuration
- **Encryption**: AES-256 encryption at rest
- **Row Level Security (RLS)**: Enabled on all tables
- **SSL/TLS**: Enforced for all connections
- **Backup**: Automated daily backups with 30-day retention

### Schema Design
```sql
-- Users table with clearance info (encrypted)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_clearance_level TEXT,
  clearance_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

## 2. Authentication & Authorization (NextAuth.js)

### Features
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA
- **Session Management**: Secure, encrypted sessions
- **OAuth Providers**: Government-approved providers only
- **Password Policy**: NIST 800-63B compliant

### Implementation
```typescript
// auth/config.ts
export const authConfig = {
  providers: [
    // Email/Password with MFA
    CredentialsProvider({
      id: 'credentials-mfa',
      name: 'Email and Password',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        // Verify credentials and MFA token
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Add clearance level to JWT (encrypted)
    },
    session: async ({ session, token }) => {
      // Decrypt and add clearance info to session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify'
  }
}
```

## 3. API Security

### Middleware Stack
1. **Rate Limiting**: 100 requests per minute per IP
2. **CORS**: Strict origin validation
3. **Headers Security**: HSTS, CSP, X-Frame-Options
4. **Input Validation**: Zod schemas for all endpoints
5. **API Key Management**: Rotating keys with expiration

### Implementation
```typescript
// middleware/security.ts
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
}
```

## 4. Compliance & Monitoring

### NIST 800-171 Compliance
- **Access Control**: RBAC with principle of least privilege
- **Audit & Accountability**: Comprehensive logging
- **Configuration Management**: Infrastructure as Code
- **Incident Response**: Automated alerting
- **System Integrity**: Regular security scans

### Monitoring
- **Real-time Alerts**: Suspicious activity detection
- **Performance Metrics**: Response time, error rates
- **Security Events**: Failed logins, permission denials
- **Compliance Reports**: Weekly automated reports

## 5. File Storage Security

### AWS S3 Configuration
- **Encryption**: SSE-S3 or SSE-KMS
- **Access**: Private buckets with signed URLs
- **Versioning**: Enabled for all buckets
- **Lifecycle**: 90-day retention for deleted objects

### Bucket Structure
```
cleared-advisory-prod/
├── resumes/           # Encrypted resume storage
├── profile-photos/    # Public CDN-cached images
├── documents/         # Sensitive documents (signed URLs)
└── audit-logs/        # Backup audit logs
```

## 6. Data Protection

### Encryption
- **At Rest**: AES-256 for all sensitive data
- **In Transit**: TLS 1.3 minimum
- **Key Management**: AWS KMS or Supabase Vault

### PII Handling
- **Minimization**: Only collect necessary data
- **Anonymization**: Remove PII from analytics
- **Retention**: Auto-delete after 3 years
- **Right to Delete**: GDPR/CCPA compliant

## 7. Incident Response

### Response Plan
1. **Detection**: Automated monitoring alerts
2. **Containment**: Auto-block suspicious IPs
3. **Investigation**: Detailed audit logs
4. **Recovery**: Automated backups
5. **Lessons Learned**: Post-incident review

### Contact Information
- Security Team: security@clearedadvisorygroup.com
- Incident Hotline: 1-800-XXX-XXXX
- On-call Rotation: PagerDuty integration

## 8. Development Security

### CI/CD Pipeline
- **SAST**: SonarQube scanning
- **Dependency Scanning**: Snyk integration
- **Secret Management**: GitHub Secrets
- **Environment Isolation**: Dev/Staging/Prod

### Code Review
- **Mandatory Reviews**: All PRs require approval
- **Security Checklist**: OWASP Top 10
- **Automated Testing**: Security test suite

## Implementation Timeline

### Phase 1 (Week 1-2)
- Supabase setup with RLS
- NextAuth.js basic implementation
- Security headers middleware

### Phase 2 (Week 3-4)
- MFA implementation
- AWS S3 integration
- Audit logging system

### Phase 3 (Week 5-6)
- Compliance monitoring
- Performance optimization
- Security testing

## Maintenance

### Regular Tasks
- **Weekly**: Security scan reports
- **Monthly**: Access review
- **Quarterly**: Penetration testing
- **Annually**: Full security audit

## Resources
- [NIST 800-171 Guide](https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final)
- [OWASP Security Checklist](https://owasp.org/www-project-application-security-verification-standard/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
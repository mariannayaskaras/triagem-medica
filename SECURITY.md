# Security Guidelines

## Overview
This document outlines security practices and considerations for the Medic AI Triagem application.

## Security Measures Implemented

### 1. Input Validation and Sanitization
- **Symptom Input**: Limited to 2000 characters with HTML tag removal
- **Location Data**: Sanitized to prevent XSS attacks
- **API Responses**: Validated and sanitized before processing

### 2. API Security
- **Google Maps API**: Configured with restrictions (domain-based)
- **External APIs**: Timeout protection and error handling
- **Rate Limiting**: Consider implementing on production

### 3. Data Protection
- **No Sensitive Data Storage**: All data processed client-side only
- **Location Privacy**: Clear warnings about VPN/proxy usage
- **Medical Disclaimers**: Clear limitations of AI-based triage

## Security Considerations

### Medical AI Limitations
⚠️ **IMPORTANT**: This application provides educational information only and should never replace professional medical advice.

- Client-side algorithm has limitations
- No patient data storage or transmission
- Clear disclaimers required at all times

### API Key Management
- Google Maps API key should be restricted by:
  - HTTP referrers (domains)
  - IP addresses (if applicable)
  - API services (Maps JavaScript API only)

### Production Security Checklist

#### Before Deployment:
- [ ] Configure Content Security Policy (CSP)
- [ ] Set up proper HTTPS certificates
- [ ] Restrict API keys to production domains
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Regular security audits

#### Runtime Security:
- [ ] Monitor API usage for abuse
- [ ] Log security-related events
- [ ] Regular dependency updates
- [ ] Security vulnerability scanning

## Content Security Policy (CSP)
Recommended CSP headers for production:

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://maps.googleapis.com; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com; 
  img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com; 
  connect-src 'self' https://maps.googleapis.com https://get.geojs.io;
```

## Incident Response
If security issues are discovered:
1. Document the issue immediately
2. Assess impact and severity
3. Implement immediate mitigations
4. Plan and execute fixes
5. Review and improve security measures

## Contact
For security concerns, please review the code thoroughly before deployment and consider professional security audit for production use.
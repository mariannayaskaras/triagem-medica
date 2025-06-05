# Security Guidelines

## Overview
This document outlines security practices and considerations for the Medic AI Triagem application.

## Security Measures Implemented

### 1. Input Validation and Sanitization
- **Symptom Input**: Limited to 2000 characters with HTML tag removal  
- **Location Data**: Sanitized to prevent XSS attacks  
- **API Responses**: Validated and sanitized before processing  

### 2. API Security
- **MapLibre GL JS**: Uses public OpenStreetMap data (no API key needed)  
- **External APIs**: Timeout protection and error handling in place  
- **Geocoding via Nominatim**: Public API with rate limit considerations  
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
- ✅ **No API keys required for MapLibre/OpenStreetMap**
- ❌ **Google Maps API removed** from codebase

## Production Security Checklist

### Before Deployment:
- [ ] Configure Content Security Policy (CSP)  
- [ ] Set up proper HTTPS certificates  
- [ ] Monitor external API usage (Nominatim)  
- [ ] Implement rate limiting  
- [ ] Add security headers  
- [ ] Regular security audits  

### Runtime Security:
- [ ] Monitor for abuse (e.g. via Nominatim geocoding endpoint)  
- [ ] Log security-related events  
- [ ] Regular dependency updates  
- [ ] Security vulnerability scanning  

## Content Security Policy (CSP)
Recommended CSP headers for production using MapLibre and OpenStreetMap:

```http
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline' https://unpkg.com; 
  font-src 'self'; 
  img-src 'self' data: https://*.tile.openstreetmap.org; 
  connect-src 'self' https://nominatim.openstreetmap.org;

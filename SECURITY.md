# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Range App, please report it responsibly.

### How to Report

1. **Do NOT open a public issue** for security vulnerabilities
2. Use [GitHub Security Advisories](https://github.com/jordanstella/range-training/security/advisories/new) to report privately
3. Alternatively, email security concerns to the maintainer

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution target**: Depends on severity

### Scope

Since Range App stores all data locally in the browser (no backend server), the primary security concerns are:

- Cross-site scripting (XSS) vulnerabilities
- Malicious input handling
- Data import/export security
- Service worker vulnerabilities

### Recognition

We appreciate responsible disclosure and will acknowledge security researchers in our release notes (with permission).

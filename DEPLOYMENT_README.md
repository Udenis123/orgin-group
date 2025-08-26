# Orgin Apps Deployment Guide

This guide explains how to deploy the 4 Orgin Angular applications to your Hostinger server with subdomain configuration.

## Applications

1. **orgin-admin** → `orgin-admin.orinest.rw`
2. **orgin-website** (formerly orgin-aweb) → `orgin-website.orinest.rw`
3. **orgin-analyzer** → `orgin-analyzer.orinest.rw`
4. **orgin-client** → `orgin-client.orinest.rw`

## Current Status

✅ **Completed:**
- All Angular applications built successfully
- Apache virtual host configurations created
- Applications deployed to web directories
- `.htaccess` files configured for Angular routing
- Apache configurations enabled and reloaded

⚠️ **Pending:**
- DNS records configuration for subdomains
- SSL certificates for subdomains

## Deployment Structure

```
/var/www/
├── orgin-admin/          # orgin-admin.orinest.rw
├── orgin-website/        # orgin-website.orinest.rw
├── orgin-analyzer/       # orgin-analyzer.orinest.rw
└── orgin-client/         # orgin-client.orinest.rw
```

## Next Steps

### 1. Configure DNS Records

You need to add A records in your DNS configuration for the following subdomains:

```
orgin-admin.orinest.rw    → [YOUR_SERVER_IP]
orgin-website.orinest.rw  → [YOUR_SERVER_IP]
orgin-analyzer.orinest.rw → [YOUR_SERVER_IP]
orgin-client.orinest.rw   → [YOUR_SERVER_IP]
```

### 2. Setup SSL Certificates

Once DNS records are configured, run:

```bash
cd /var/www/deals/orgin-group
./deploy-orgin-apps.sh ssl
```

### 3. Test Applications

After DNS and SSL are configured, test the applications:

- https://orgin-admin.orinest.rw
- https://orgin-website.orinest.rw
- https://orgin-analyzer.orinest.rw
- https://orgin-client.orinest.rw

## Deployment Script

A deployment script has been created at `/var/www/deals/orgin-group/deploy-orgin-apps.sh`

### Usage:

```bash
# Deploy all applications
./deploy-orgin-apps.sh deploy

# Setup SSL certificates only
./deploy-orgin-apps.sh ssl
```

## Apache Configuration Files

The following Apache configuration files have been created:

### HTTP (Port 80):
- `/etc/apache2/sites-available/orgin-admin.orinest.rw.conf`
- `/etc/apache2/sites-available/orgin-website.orinest.rw.conf`
- `/etc/apache2/sites-available/orgin-analyzer.orinest.rw.conf`
- `/etc/apache2/sites-available/orgin-client.orinest.rw.conf`

### HTTPS (Port 443):
- `/etc/apache2/sites-available/orgin-admin.orinest.rw-le-ssl.conf`
- `/etc/apache2/sites-available/orgin-website.orinest.rw-le-ssl.conf`
- `/etc/apache2/sites-available/orgin-analyzer.orinest.rw-le-ssl.conf`
- `/etc/apache2/sites-available/orgin-client.orinest.rw-le-ssl.conf`

## Troubleshooting

### Check Apache Status
```bash
systemctl status apache2
apache2ctl configtest
```

### Check Application Logs
```bash
tail -f /var/log/apache2/orgin-admin_error.log
tail -f /var/log/apache2/orgin-website_error.log
tail -f /var/log/apache2/orgin-analyzer_error.log
tail -f /var/log/apache2/orgin-client_error.log
```

### Check SSL Certificate Status
```bash
certbot certificates
```

### Rebuild and Deploy Applications
```bash
cd /var/www/deals/orgin-group
./deploy-orgin-apps.sh deploy
```

## File Permissions

All web directories have been set with proper permissions:
- Owner: `www-data:www-data`
- Permissions: `755`

## Angular Configuration

Each application has been configured with:
- Production build optimization
- `.htaccess` file for client-side routing
- Proper file permissions

## Notes

- The applications are currently accessible via HTTP (port 80) but will redirect to HTTPS once SSL certificates are configured
- All applications use the existing SSL certificate from `orinest.rw` domain
- The deployment script can be used for future updates and deployments
- Make sure to test each application after DNS and SSL configuration

## Support

If you encounter any issues:
1. Check Apache error logs
2. Verify DNS propagation
3. Ensure SSL certificates are valid
4. Test application builds locally before deployment

---
title: WordPress Security Hardening
category: wordpress
date: 2026-01-12
author: Josh Priddle
tags:
  - WordPress
  - Security
  - Hardening
excerpt: |
  Essential security measures to protect your WordPress site from common
  attacks. Covers authentication, file permissions, and monitoring.
---

WordPress powers over 40% of the web, making it a prime target for attackers. A compromised site can serve malware, send spam, or leak customer data. Here's how to protect yourself.

## The Threat Landscape

Most WordPress attacks aren't sophisticated. They're automated bots exploiting:

1. **Weak credentials** - Password spraying against wp-login.php
2. **Outdated software** - Known vulnerabilities in old plugins/themes
3. **Insecure plugins** - Poorly coded extensions with security flaws
4. **Default configurations** - Predictable paths and settings

Addressing these fundamentals blocks 99% of attacks.

## Authentication Security

### Strong Passwords

Every account needs a unique, complex password:

```
Minimum requirements:
- 16+ characters
- Mixed case letters
- Numbers
- Special characters
- No dictionary words
```

Use a password manager. Never reuse passwords across sites.

### Two-Factor Authentication

2FA is non-negotiable for admin accounts. Options:

**TOTP (Time-based One-Time Password)**
- Works with Google Authenticator, 1Password, Authy
- No internet required for codes
- Install WP 2FA or Wordfence

**Hardware Keys**
- YubiKey, Google Titan
- Phishing-resistant
- Requires WebAuthn support

Configure 2FA immediately after WordPress installation.

### Limit Login Attempts

Brute force attacks try thousands of passwords per hour. Throttle them:

```php
// Or use a plugin like Limit Login Attempts Reloaded
add_filter('authenticate', function($user, $username, $password) {
    if (get_transient('login_attempts_' . $_SERVER['REMOTE_ADDR']) > 5) {
        return new WP_Error('too_many_attempts', 'Too many login attempts. Try again later.');
    }
    return $user;
}, 30, 3);
```

BuiltFast includes rate limiting at the infrastructure level, but application-level protection adds defense in depth.

### Hide the Login Page

Security through obscurity isn't a solution, but it reduces noise:

```php
// Change wp-login.php to /secure-login/
// Use WPS Hide Login plugin or similar
```

## Software Updates

### Core WordPress

Enable automatic updates for minor releases:

```php
// wp-config.php
define('WP_AUTO_UPDATE_CORE', 'minor');
```

Major version updates should be tested in staging first.

### Plugins and Themes

The #1 source of WordPress vulnerabilities. Strategies:

1. **Enable auto-updates** for trusted plugins
2. **Monitor security advisories** - WPScan, Patchstack
3. **Remove unused plugins** - Even deactivated, they can be exploited
4. **Audit before installing** - Check last update date, review count

```php
// Enable auto-updates for specific plugins
add_filter('auto_update_plugin', function($update, $item) {
    $trusted = ['wordfence', 'yoast-seo', 'contact-form-7'];
    return in_array($item->slug, $trusted) ? true : $update;
}, 10, 2);
```

## File System Security

### Correct Permissions

WordPress files should be owned by the web server user:

```
Directories: 755
Files: 644
wp-config.php: 600
```

Never set 777 permissions on anything.

### Prevent PHP Execution in Uploads

The uploads directory should never execute PHP:

```apache
# /wp-content/uploads/.htaccess
<FilesMatch "\.php$">
    deny from all
</FilesMatch>
```

### Protect wp-config.php

Move sensitive configuration above web root if possible:

```
/home/user/
├── wp-config.php     # Contains real config
└── public_html/
    └── wp-config.php # Includes the file above
```

If you can't move it, protect it:

```apache
<Files wp-config.php>
    order allow,deny
    deny from all
</Files>
```

## Database Security

### Change Table Prefix

Default `wp_` prefix makes SQL injection attacks easier. Change during installation or migrate existing sites:

```php
// wp-config.php
$table_prefix = 'xyz123_';
```

### Limit Database Privileges

WordPress only needs these MySQL permissions:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER
ON wordpress_db.*
TO 'wordpress_user'@'localhost';
```

Never grant ALL PRIVILEGES or SUPER.

### Sanitize User Input

If writing custom code, always sanitize and escape:

```php
// Sanitize input
$safe_title = sanitize_text_field($_POST['title']);

// Prepare queries
$wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE post_title = %s", $safe_title);

// Escape output
echo esc_html($user_data);
echo esc_url($link);
echo esc_attr($attribute);
```

## Security Headers

Add headers to prevent common attacks:

```php
// functions.php or mu-plugin
add_action('send_headers', function() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header("Content-Security-Policy: default-src 'self'");
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
});
```

Or configure at the server level in BuiltFast dashboard.

## Monitoring and Response

### Activity Logging

Track user actions with WP Activity Log or Wordfence:

- Login attempts (successful and failed)
- Post/page modifications
- Plugin installations
- Setting changes

### File Integrity Monitoring

Detect unauthorized changes:

```bash
# Generate baseline
find /path/to/wordpress -type f -exec md5sum {} \; > baseline.txt

# Compare later
md5sum -c baseline.txt 2>&1 | grep -v "OK$"
```

Wordfence includes automated file scanning.

### Incident Response Plan

Have a plan before you need it:

1. **Detection** - How will you know you're compromised?
2. **Containment** - Isolate affected systems
3. **Eradication** - Clean malware, patch vulnerabilities
4. **Recovery** - Restore from clean backup
5. **Post-Incident** - Document and improve defenses

## Security Checklist

Implement these measures immediately:

- [ ] Strong, unique passwords for all accounts
- [ ] Two-factor authentication for admins
- [ ] Login attempt limiting
- [ ] Automatic updates enabled
- [ ] Unused plugins/themes removed
- [ ] File permissions verified
- [ ] PHP disabled in uploads
- [ ] wp-config.php protected
- [ ] Security headers configured
- [ ] Activity logging enabled
- [ ] Regular backups verified

## Regular Maintenance

Security isn't set-and-forget. Schedule monthly:

1. Review user accounts - remove unused
2. Audit installed plugins - update or remove
3. Check activity logs - investigate anomalies
4. Run malware scan - Wordfence or external
5. Test backup restoration - verify it works
6. Review security headers - tools like securityheaders.com

A secure WordPress site requires ongoing attention. Build these habits now.

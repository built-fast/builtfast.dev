---
title: Setting Up a New WordPress Site
category: wordpress
date: 2026-01-20
author: Josh Priddle
tags:
  - WordPress
  - Setup
  - Getting Started
excerpt: |
  A complete walkthrough for setting up a fresh WordPress installation on
  BuiltFast hosting, from initial deployment to essential configuration.
---

Getting a WordPress site up and running on BuiltFast takes just a few minutes. This guide walks you through the essential setup steps to ensure your site is configured correctly from the start.

## Creating Your Site

After logging into the BuiltFast dashboard, navigate to **Sites > Create New Site**. You'll be prompted for a few details:

- **Site Name**: A friendly identifier for your dashboard (e.g., "My Company Blog")
- **Domain**: Your primary domain, or use a temporary staging domain
- **PHP Version**: We recommend PHP 8.3 for new WordPress installations

Once created, your site will provision automatically. This typically takes 30-60 seconds.

## Accessing WordPress Admin

Your initial WordPress credentials are available in the BuiltFast dashboard under **Sites > [Your Site] > Credentials**. You'll find:

- **Admin URL**: `https://yourdomain.com/wp-admin/`
- **Username**: Generated automatically
- **Password**: One-time display, save it securely

We strongly recommend changing your password immediately after first login.

## Essential First Steps

### 1. Update WordPress Core

Even on a fresh install, check for updates at **Dashboard > Updates**. BuiltFast deploys the latest stable version, but point releases may be available.

### 2. Remove Default Content

Delete the sample content WordPress ships with:

- **Posts**: "Hello World!" post
- **Pages**: "Sample Page"
- **Comments**: Sample comment on the Hello World post

### 3. Configure Permalinks

Navigate to **Settings > Permalinks** and select your preferred URL structure. For most sites, we recommend **Post name**:

```
https://yourdomain.com/sample-post/
```

This creates clean, SEO-friendly URLs. Click **Save Changes** to generate the necessary rewrite rules.

### 4. Set Your Timezone

Under **Settings > General**, set your timezone to match your primary audience. This affects:

- Scheduled post publishing
- Comment timestamps
- Plugin scheduling (backups, maintenance)

### 5. Configure Reading Settings

At **Settings > Reading**, decide your homepage display:

- **Your latest posts**: Blog-style homepage
- **A static page**: Select a specific page as your homepage

If using a static homepage, also set your Posts page for your blog archive.

## Security Baseline

### Strong Admin Password

Use a password manager to generate a unique, strong password. Aim for 20+ characters with mixed case, numbers, and symbols.

### Two-Factor Authentication

Install a 2FA plugin immediately. Recommended options:

- **WP 2FA** - Simple and effective
- **Wordfence** - Includes 2FA plus broader security features

### Limit Login Attempts

BuiltFast includes rate limiting at the platform level, but adding application-level protection provides defense in depth. Configure your security plugin to:

- Lock out IPs after 3-5 failed attempts
- Increase lockout duration for repeat offenders

## Next Steps

With your WordPress site configured, you're ready to:

- [Install and configure your theme](/kb/wordpress-theme-setup/)
- [Set up essential plugins](/kb/wordpress-essential-plugins/)
- [Configure caching for performance](/kb/wordpress-caching/)

If you run into issues during setup, our support team is available 24/7 through the BuiltFast dashboard.

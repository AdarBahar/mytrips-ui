# Content Security Policy (CSP) Fix Guide

## 🚨 **Issue Identified: CSP Violation**

Your MyTrips UI is deployed at `www.bahar.co.il/MyTrips/` but cannot connect to the API due to a **Content Security Policy** restriction.

### **Error Details:**
```
Refused to connect to 'https://mytrips-api.bahar.co.il/auth/login' 
because it violates the following Content Security Policy directive: 
"connect-src 'self' https://www.bahar.co.il https://bahar.co.il ..."
```

**Root Cause**: The hosting provider's CSP doesn't include `https://mytrips-api.bahar.co.il` in the allowed `connect-src` domains.

## ✅ **Solution: Updated Files with CSP Fix**

I've created updated files that include the MyTrips API domain in the CSP policy.

### **Fixed Files:**
- ✅ **`mytrips-ui-production-csp-fixed.zip`** - Updated deployment package
- ✅ **`.htaccess`** - Server-level CSP override
- ✅ **`index.html`** - HTML meta tag CSP fallback

## 🔧 **Deployment Fix Steps**

### **Option 1: Replace Current Files (Recommended)**

1. **Download the Fixed Package**:
   - Use the new file: `mytrips-ui-production-csp-fixed.zip`
   - Location: `/Users/adar.bahar/Code/mytrips-ui/mytrips-ui-production-csp-fixed.zip`

2. **Replace Files on Server**:
   - Access your InMotion Hosting File Manager
   - Navigate to `public_html/MyTrips/`
   - **Delete existing files** (backup first if needed)
   - **Upload** the new `mytrips-ui-production-csp-fixed.zip`
   - **Extract** the ZIP file
   - **Delete** the ZIP file after extraction

### **Option 2: Update Individual Files**

If you prefer to update just the problematic files:

#### **Update .htaccess File:**
Replace the `.htaccess` file content with:
```apache
# React Router Support - Redirect all requests to index.html
Options -MultiViews
RewriteEngine On

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Content Security Policy - Allow MyTrips API
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.bahar.co.il https://bahar.co.il https://mytrips-api.bahar.co.il https://api.amplitude.com https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; frame-src 'none'; object-src 'none'; base-uri 'self';"

# Cache Control for Assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header set Cache-Control "public, max-age=2592000"
</filesMatch>

# Cache Control for HTML
<filesMatch "\.(html)$">
    ExpiresActive On
    ExpiresDefault "access plus 0 seconds"
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</filesMatch>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Error Pages
ErrorDocument 404 /index.html
```

#### **Update index.html File:**
Add this meta tag in the `<head>` section:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.bahar.co.il https://bahar.co.il https://mytrips-api.bahar.co.il https://api.amplitude.com https://api.eu.amplitude.com https://sr-client-cfg.eu.amplitude.com https://api.brevo.com https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; frame-src 'none'; object-src 'none'; base-uri 'self';">
```

## 🔍 **What the Fix Does**

### **CSP Policy Changes:**
- ✅ **Added**: `https://mytrips-api.bahar.co.il` to `connect-src`
- ✅ **Preserved**: All existing allowed domains
- ✅ **Maintained**: Security restrictions for other directives

### **Dual Protection:**
- ✅ **Server-level**: `.htaccess` header override
- ✅ **Client-level**: HTML meta tag fallback
- ✅ **Compatibility**: Works with InMotion Hosting configuration

## 🧪 **Testing After Fix**

### **1. Clear Browser Cache**
- **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Clear cache**: Browser settings → Clear browsing data
- **Incognito mode**: Test in private/incognito window

### **2. Test API Connectivity**
- Visit: `https://www.bahar.co.il/MyTrips/`
- Open **Developer Tools** (F12)
- Go to **Console** tab
- Try to **login** with your credentials
- **Verify**: No CSP errors in console

### **3. Verify Full Functionality**
- ✅ **Login page** loads without errors
- ✅ **Authentication** works successfully
- ✅ **Trips page** loads and displays data
- ✅ **API calls** complete without CSP violations
- ✅ **Navigation** works on all routes

## 🚨 **Alternative Solutions (If Fix Doesn't Work)**

### **Option A: Contact Hosting Provider**
If the CSP override doesn't work, contact InMotion Hosting support to:
- Add `https://mytrips-api.bahar.co.il` to the server-level CSP
- Request CSP modification for your domain

### **Option B: API Proxy (Advanced)**
Create a server-side proxy to route API calls through your domain:
- API calls go to `https://www.bahar.co.il/api/proxy/`
- Server forwards requests to `https://mytrips-api.bahar.co.il`
- Responses returned through your domain

### **Option C: Subdomain Deployment**
Deploy to a subdomain with its own CSP:
- Create subdomain: `mytrips.bahar.co.il`
- Deploy application there with custom CSP
- Full control over security policies

## 📋 **Post-Fix Checklist**

- [ ] **Upload** fixed files to server
- [ ] **Clear** browser cache completely
- [ ] **Test** login functionality
- [ ] **Verify** no console errors
- [ ] **Check** all API calls work
- [ ] **Test** on different browsers
- [ ] **Confirm** mobile functionality

## 🎯 **Expected Results**

After applying the fix:
- ✅ **No CSP errors** in browser console
- ✅ **API calls succeed** to MyTrips API
- ✅ **Login functionality** works properly
- ✅ **Trip management** fully operational
- ✅ **All features** function as expected

## 🔧 **Files Ready for Deployment**

**Updated Package**: `mytrips-ui-production-csp-fixed.zip`
**Location**: `/Users/adar.bahar/Code/mytrips-ui/mytrips-ui-production-csp-fixed.zip`

This package contains all the necessary fixes to resolve the CSP violation and restore full functionality to your MyTrips UI! 🚀

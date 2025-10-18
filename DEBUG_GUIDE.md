# 🐛 MyTrips Frontend Debug Guide

## Overview

The MyTrips frontend application includes a comprehensive debug system to help troubleshoot authentication flows, API calls, and application state. This guide explains how to use the debugging features effectively.

## Debug Features

### 1. **Debug Panel** 🎛️
A floating debug panel that provides quick access to debugging tools and information.

**Location**: Bottom-right corner of the screen (🐛 button)

**Features**:
- Toggle debug mode on/off
- View authentication status
- Test API connectivity
- Clear localStorage
- Log current application state

### 2. **Console Logging** 📝
Detailed logging of all API requests, responses, and authentication flows.

**Categories**:
- `[API:REQUEST]` - Outgoing API requests
- `[API:RESPONSE]` - Successful API responses  
- `[API:ERROR]` - Failed API requests
- `[AUTH]` - Authentication flow events
- `[STORAGE]` - localStorage operations
- `[ERROR:*]` - Error conditions

### 3. **Global Debug Object** 🌐
Access debug functions from the browser console.

**Available at**: `window.mytripsDebug`

## How to Use

### Quick Start

1. **Open the application** in your browser
2. **Look for the 🐛 button** in the bottom-right corner
3. **Click it** to open the debug panel
4. **Enable debug mode** if not already enabled
5. **Open browser console** (F12 → Console tab)
6. **Perform actions** (login, navigate, etc.) and watch the logs

### Debug Panel Usage

#### Authentication Status
The panel shows:
- ✅/❌ **Authenticated**: Whether user is logged in
- ✅/❌ **Has Token**: Whether auth token exists
- ✅/❌ **Remember Me**: Whether remember me credentials are stored
- **Email**: Stored email for remember me

#### Available Actions
- **Test API Connection**: Makes a test API call to verify connectivity
- **Refresh Auth Info**: Updates the authentication status display
- **Log Current State**: Outputs complete application state to console
- **Clear All Storage**: Removes all localStorage data (⚠️ logs you out)

### Console Commands

Access these from the browser console:

```javascript
// Toggle debug mode
window.mytripsDebug.toggle()

// Check current debug configuration
window.mytripsDebug.config

// Manual logging
window.mytripsDebug.logger.auth('Custom auth message', { data: 'example' })
window.mytripsDebug.logger.api('CUSTOM', '/test/endpoint', { test: true })
```

### Reading Debug Logs

#### API Request Example
```
[API:REQUEST] 2024-01-15T10:30:00Z POST /auth/login
▼ {url: "/auth/login", method: "post", headers: {...}, data: {...}}
```

#### API Response Example
```
[API:RESPONSE] 2024-01-15T10:30:00Z 200 POST /auth/login
▼ {status: 200, data: {...}, headers: {...}}
```

#### Authentication Flow Example
```
[AUTH] 2024-01-15T10:30:00Z Starting login process
▼ {email: "user@example.com"}

[AUTH] 2024-01-15T10:30:00Z Login successful - token stored
```

#### Error Example
```
[ERROR:AUTH] 2024-01-15T10:30:00Z Login failed
▼ Error: Invalid credentials
  Context: {email: "user@example.com", status: 401}
```

## Troubleshooting Common Issues

### 1. **CORS Errors**
**Symptoms**: Network errors, blocked requests
**Debug**: Look for `[API:ERROR]` logs with CORS-related messages
**Solution**: 
- Check if API allows localhost origin
- Use browser with CORS disabled for testing
- Verify API endpoint URL

### 2. **Authentication Failures**
**Symptoms**: Login doesn't work, redirected to login page
**Debug**: 
- Check `[AUTH]` logs for login flow
- Verify `[API:REQUEST]` and `[API:RESPONSE]` for `/auth/login`
- Check if token is stored: `[STORAGE] SET authToken`

### 3. **Remember Me Issues**
**Symptoms**: Not automatically logged in on return
**Debug**:
- Check debug panel for "Remember Me" status
- Look for `[AUTH] Remember me credentials found/not found`
- Verify credentials storage: `[STORAGE] SET userEmail/userPassword`

### 4. **Token Expiration**
**Symptoms**: Suddenly logged out, 401 errors
**Debug**:
- Look for `[AUTH] Token expired or invalid`
- Check `[API:ERROR]` logs with 401 status
- Verify token removal: `[STORAGE] REMOVE authToken`

## Debug Configuration

### Enabling/Disabling Debug Mode

**Via Debug Panel**: Toggle the checkbox
**Via Console**: `window.mytripsDebug.toggle()`
**Persistent**: Setting is saved in localStorage

### Debug Categories

You can control which types of logs are shown by modifying `src/config/debug.js`:

```javascript
levels: {
  API: true,      // API requests/responses
  AUTH: true,     // Authentication flows  
  ROUTING: true,  // Route changes
  STORAGE: true,  // localStorage operations
}
```

### Production Considerations

- Set `debugConfig.enabled = false` in production
- Debug logs are only shown when enabled
- Debug panel is always available but can be hidden
- No performance impact when disabled

## API Testing

### Manual API Testing

Use the debug panel's "Test API Connection" button or console:

```javascript
// Test login endpoint
const result = await window.mytripsDebug.logger.auth('Testing login');
```

### Monitoring Network Traffic

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Perform actions in the app
4. Check requests to `mytrips-api.bahar.co.il`
5. Compare with debug console logs

## Tips for Effective Debugging

1. **Always check console first** - Most issues show up in debug logs
2. **Use debug panel** for quick status checks
3. **Clear storage** when testing different scenarios
4. **Monitor both console and network tabs** for complete picture
5. **Test with debug mode off** to verify production behavior

## Getting Help

If you encounter issues:

1. **Enable debug mode**
2. **Reproduce the issue**
3. **Copy relevant console logs**
4. **Note debug panel status**
5. **Check network tab for failed requests**
6. **Share logs with development team**

---

**Happy Debugging!** 🐛✨

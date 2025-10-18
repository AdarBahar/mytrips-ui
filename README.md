# MyTrips Frontend Application

A React frontend application for the MyTrips road trip planning API, built with Vite for fast development and modern tooling.

## 🚀 Features

- **Authentication System**: Email/password login with "Remember Me" functionality
- **Protected Routes**: Automatic redirects and token validation
- **Trip Management**: View and manage your road trips
- **Modern UI**: Clean, responsive design with professional styling
- **Debug System**: Comprehensive debugging tools for development

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

## 🔧 Configuration

### API Endpoint
The application connects to: `https://mytrips-api.bahar.co.il`

### Environment Setup
No additional environment configuration needed for basic usage.

## 🐛 Debugging

This application includes a comprehensive debug system for troubleshooting:

### Quick Debug Access
1. Look for the 🐛 button in the bottom-right corner
2. Click to open the debug panel
3. Enable debug mode to see detailed console logs
4. Open browser console (F12) to view API requests/responses

### Debug Features
- **API Request/Response Logging**: See all network traffic
- **Authentication Flow Tracking**: Monitor login/logout processes
- **Storage Operations**: Track localStorage changes
- **Error Handling**: Detailed error information with context

### Console Commands
```javascript
// Toggle debug mode
window.mytripsDebug.toggle()

// View current configuration
window.mytripsDebug.config
```

For detailed debugging instructions, see [DEBUG_GUIDE.md](./DEBUG_GUIDE.md)

## 📱 Usage

### Authentication Flow
1. **Homepage**: Welcome page with login button
2. **Login**: Enter email/password, optionally check "Remember Me"
3. **Trips Page**: View trips with welcome message and logout option

### Remember Me Feature
- Stores credentials securely in localStorage
- Automatically re-authenticates on app reload
- Can be disabled by unchecking the option

### Protected Routes
- `/trips` requires authentication
- Automatic redirect to login if not authenticated
- Preserves intended destination after login

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   └── DebugPanel.jsx  # Debug interface
├── contexts/
│   └── AuthContext.jsx # Global auth state
├── pages/
│   ├── HomePage.jsx    # Landing page
│   ├── LoginPage.jsx   # Login form
│   └── TripsPage.jsx   # Main app page
├── services/
│   ├── api.js          # API client setup
│   └── auth.js         # Auth service functions
├── config/
│   └── debug.js        # Debug configuration
└── App.jsx             # Main app component
```

## 🔒 Security Notes

- Tokens stored in localStorage (consider httpOnly cookies for production)
- Remember Me credentials stored in plain text (encrypt for production)
- CORS configuration may need adjustment for different domains

## 🚨 Troubleshooting

### Common Issues

**CORS Errors**: API only allows specific origins. For local development:
```bash
# Chrome with CORS disabled (testing only)
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

**Authentication Issues**:
- Check debug panel for auth status
- Verify API credentials
- Clear localStorage if needed

**Network Issues**:
- Verify API endpoint is accessible
- Check browser network tab
- Enable debug mode for detailed logs

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Enable debug mode for development
2. Check console logs for any errors
3. Test authentication flow thoroughly
4. Verify responsive design on different screen sizes

---

Built with ❤️ using React + Vite

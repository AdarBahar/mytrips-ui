# MyTrips Frontend Application

A React frontend application for the MyTrips road trip planning API, built with Vite for fast development and modern tooling.

## 🚀 Features

### Core Functionality
- **Authentication System**: Email/password login with "Remember Me" functionality
- **Protected Routes**: Automatic redirects and token validation
- **Trip Management**: Create, view, edit, and manage your road trips
- **Trip Status Management**: Active, completed, and cancelled trip states

### Route Visualization
- **Route Legs Display**: Numbered route segments showing start → via stops → end
- **Google Maps Integration**: Interactive multi-waypoint directions
- **Daily Route Maps**: Individual day route visualization
- **Trip Overview Maps**: Multi-day trip route summaries
- **Mobile Responsive**: Perfect route display on all devices

### User Experience
- **Modern UI**: Clean, responsive design with professional styling
- **Collapsible Sections**: Organized trip data with expandable day details
- **Loading States**: Smooth loading animations and progress indicators
- **Error Handling**: Graceful error handling with user-friendly messages
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

#### Development
No additional environment configuration needed for basic usage.

#### Production
For production deployment with Google Maps integration:

1. **Copy Environment Template**:
   ```bash
   cp .env.production.example .env.production
   ```

2. **Configure Google Maps API Key**:
   ```bash
   # Edit .env.production
   VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   ```

3. **Get Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable **Maps Embed API** and **Maps JavaScript API**
   - Create API key with domain restrictions: `*.bahar.co.il/*`

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
│   ├── Auth/                    # Authentication components
│   ├── DailyRouteMap.jsx       # Daily route visualization with Google Maps
│   ├── OptimizedStopsList.jsx  # Optimized route stops display
│   ├── TripOverviewMap.jsx     # Multi-day trip overview maps
│   └── DebugPanel.jsx          # Debug interface
├── contexts/
│   └── AuthContext.jsx         # Global auth state management
├── pages/
│   ├── HomePage.jsx            # Landing page
│   ├── LoginPage.jsx           # Login form
│   ├── TripsPage.jsx           # Trip listing and management
│   └── TripDetailPage.jsx      # Individual trip details with route legs
├── services/
│   ├── api.js                  # API client setup with interceptors
│   └── auth.js                 # Auth and trip service functions
├── config/
│   └── debug.js                # Debug configuration and logging
├── App.jsx                     # Main app component with routing
└── App.css                     # Global styles including route visualization
```

### Configuration Files
```
├── .env.production.example     # Environment template (safe to commit)
├── .env.production            # Production environment (git ignored)
├── .gitignore                 # Excludes sensitive files and deployment packages
├── dist/                      # Build output directory
│   └── .htaccess             # Apache configuration for routing and CSP
└── README.md                 # This file
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

### Development Build
```bash
# Build for development/testing
npm run build

# Preview production build locally
npm run preview
```

### Production Deployment

#### Prerequisites
1. **Environment Configuration**: Set up `.env.production` with Google Maps API key (see Configuration section)
2. **Server Access**: Access to production server (InMotion hosting)
3. **Domain Setup**: Application deployed to `/MyTrips/` subdirectory

#### Deployment Steps

1. **Build with Environment Variables**:
   ```bash
   # Ensure .env.production is configured
   npm run build
   ```

2. **Create Deployment Package**:
   ```bash
   # Navigate to build output
   cd dist

   # Create deployment zip with all files including .htaccess
   zip -r ../mytrips-ui-latest.zip . .htaccess

   # Return to project root
   cd ..
   ```

3. **Deploy to Production**:
   ```bash
   # Upload mytrips-ui-latest.zip to your server
   # Extract to /MyTrips/ directory (replace all existing files)
   # Verify .htaccess file is present for proper routing
   ```

4. **Verify Deployment**:
   - Visit: `https://www.bahar.co.il/MyTrips/`
   - Test authentication flow
   - Verify Google Maps are loading (no 403 errors)
   - Check route legs visualization with interactive maps

#### Deployment Features
- ✅ **Environment-Aware Routing**: Works in `/MyTrips/` subdirectory
- ✅ **Google Maps Integration**: Interactive route visualization
- ✅ **Route Legs Display**: Numbered route segments with maps
- ✅ **CSP Configuration**: Proper security headers via `.htaccess`
- ✅ **Mobile Responsive**: Perfect on all devices

#### Troubleshooting Deployment
- **Maps not loading**: Check Google Maps API key and domain restrictions
- **Routing issues**: Verify `.htaccess` file is present and configured
- **403 errors**: Check CSP configuration in `.htaccess`
- **Blank page**: Check browser console for JavaScript errors

### Security Notes
- ✅ **API Keys**: Compiled into JavaScript bundle (normal for frontend)
- ✅ **Environment Files**: `.env.production` excluded from git tracking
- ✅ **Deployment Packages**: `*.zip` files excluded from git tracking
- ✅ **Domain Restrictions**: Google Maps API key restricted to production domain

## 🤝 Contributing

1. Enable debug mode for development
2. Check console logs for any errors
3. Test authentication flow thoroughly
4. Verify responsive design on different screen sizes

---

Built with ❤️ using React + Vite

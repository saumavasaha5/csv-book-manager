# 📚 CSV Book Manager

A modern, full-stack web application for managing large CSV files containing book data. Upload, edit, filter, and download CSV files with up to 50,000+ records efficiently.

![CSV Book Manager](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![Material-UI](https://img.shields.io/badge/Material--UI-5.15-purple)

## ✨ Features

### 🚀 Core Functionality
- **Large File Support**: Handle CSV files with 10,000+ rows efficiently
- **Drag & Drop Upload**: Modern file upload with drag-and-drop interface
- **Sample Data Generation**: Generate realistic book data (1,000-50,000 records)
- **In-line Editing**: Edit cells directly in the data grid with auto-save
- **CSV Export**: Download edited data as a new CSV file
- **Reset Functionality**: Revert all changes to original data

### 🔍 Advanced Features
- **Smart Filtering**: Filter by genre, author, and publication year
- **Column Sorting**: Sort any column ascending/descending
- **Quick Search**: Global search across all data
- **Change Tracking**: Visual highlighting of modified rows in yellow
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Status**: Live record counts and modification indicators

### 🎨 User Experience
- **Modern Material-UI Design**: Clean, professional interface
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Accessibility**: Full keyboard navigation support

## 🏗️ Technical Architecture

### Frontend (React 18 + JavaScript)
- **React 18** with modern hooks and functional components
- **Material-UI (MUI) v5.15** for consistent, accessible design
- **MUI DataGrid v6.18** for efficient virtualized data rendering
- **Axios** for API communication
- **React Dropzone** for file upload functionality

### Backend (Node.js/Express)
- **Express.js** server with CORS support
- **Multer** for file upload handling (50MB limit)
- **PapaParse** for CSV parsing and generation
- **UUID** for session management
- **In-memory storage** for demo (easily scalable to Redis/database)

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 16+** and npm installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Extract the ZIP file**
   ```bash
   unzip csv-book-manager.zip
   cd csv-book-manager
   ```

2. **Install All Dependencies**
   ```bash
   npm run install:all
   ```
   This will install dependencies for both backend and frontend.

3. **Start Development Servers**
   ```bash
   npm run dev
   ```
   This starts both servers concurrently:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000

4. **Open Your Browser**
   Navigate to **http://localhost:3000** to use the application.

### Alternative: Manual Setup

If you prefer to start servers separately:

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Terminal 1: Start Backend (Port 8000)
npm run dev:backend

# Terminal 2: Start Frontend (Port 3000)  
npm run dev:frontend
```

## 🏗️ Build & Production

### Development Build
```bash
npm run dev  # Starts both servers in development mode
```

### Production Build
```bash
npm run build  # Builds frontend for production
npm start      # Starts production server
```

The production build creates optimized files in `frontend/build/` directory.

## 📊 Sample CSV Format

The application expects CSV files with these columns:

```csv
Title,Author,Genre,PublishedYear,ISBN
The Great Adventure,John Smith,Fiction,2020,978-1-234567-89-0
Mysteries of Time,Jane Doe,Mystery,2019,978-1-234567-90-6
Love in the City,Bob Johnson,Romance,2021,978-1-234567-91-3
```

### Supported Genres
Fiction | Non-Fiction | Mystery | Romance | Sci-Fi | Fantasy | Biography | History | Science | Philosophy

## 🎯 How to Use

### 1. **Getting Started**
- **Upload CSV**: Drag and drop your CSV file or click to browse
- **Generate Sample Data**: Create test data (1,000-50,000 book records)
- **File Requirements**: CSV format, up to 50MB

### 2. **Editing Data**
- **Double-click any cell** to edit inline
- **Changes auto-save** - no manual save needed
- **Modified rows highlighted** in yellow
- **Track changes** with the modification counter

### 3. **Filtering & Searching**
- **Quick Search**: Use search bar in toolbar
- **Advanced Filters**: Click "Filter" button:
  - Filter by genre (dropdown)
  - Filter by author (text search)  
  - Filter by year range
- **Clear All Filters**: Reset with one click

### 4. **Data Management**
- **Download CSV**: Export your edited data
- **Reset All Changes**: Revert to original data
- **View Statistics**: See record counts and status

## 🔧 Available Scripts

### Root Package Scripts
- `npm run dev` - Start both frontend and backend
- `npm run dev:backend` - Start backend only (port 8000)
- `npm run dev:frontend` - Start frontend only (port 3000)
- `npm run build` - Build frontend for production
- `npm start` - Start production server
- `npm run install:all` - Install all dependencies

### Frontend Scripts  
```bash
cd frontend
npm start    # Start development server
npm run build # Create production build
npm test     # Run tests (if any)
```

## 🔧 Configuration

### Environment Variables
Create `.env` files if needed:

**Backend (.env in root directory):**
```env
PORT=8000
NODE_ENV=development
```

**Frontend (.env in frontend directory):**
```env
REACT_APP_API_URL=http://localhost:8000/api
PORT=3000
```

### Port Configuration
Default ports:
- **Frontend**: 3000
- **Backend**: 8000
- **API Proxy**: Frontend proxies `/api` requests to backend

## 🔧 API Endpoints

### File Operations
- `POST /api/upload` - Upload CSV file
- `GET /api/generate-sample?count=N` - Generate sample data (1K-50K records)

### Data Management  
- `GET /api/data/:sessionId` - Retrieve session data
- `PUT /api/data/:sessionId` - Update session data
- `POST /api/reset/:sessionId` - Reset to original data
- `GET /api/download/:sessionId` - Download edited CSV

### System
- `GET /api/health` - Server health check

## 📱 Responsive Design

Fully optimized for all devices:
- **Desktop** (1200px+): Full feature set
- **Tablet** (768-1199px): Touch-friendly layout
- **Mobile** (320-767px): Compact essential view

## 🛠️ Project Structure

```
csv-book-manager/
├── backend/
│   ├── server.js          # Express server & API routes
│   └── uploads/           # Temporary file storage (auto-created)
├── frontend/
│   ├── public/            # Static files & favicon
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── DataTable.js     # Main data grid component  
│   │   │   └── FileUpload.js    # Upload & sample generation
│   │   ├── api/           
│   │   │   └── csvApi.js        # API communication functions
│   │   ├── App.js              # Main application component
│   │   ├── App.css             # Custom styles
│   │   ├── index.js            # React entry point
│   │   └── reportWebVitals.js  # Performance monitoring
│   ├── package.json       # Frontend dependencies
│   └── package-lock.json  # Frontend lock file
├── package.json           # Root dependencies & scripts
├── package-lock.json      # Root lock file
└── README.md             # This documentation
```

## ⚡ Performance Features

### Large Dataset Optimizations
- **Virtualized Data Grid**: Renders only visible rows
- **Debounced Auto-save**: Prevents excessive API calls
- **Client-side Filtering**: Instant filter results
- **Efficient Change Tracking**: Only modified data tracked

### Memory Management
- **Minimal Memory Footprint**: Efficient data structures
- **Automatic Cleanup**: Temp files removed after processing
- **Session Management**: UUID-based session handling

## 🔒 Security Features

- **File Type Validation**: CSV files only
- **File Size Limits**: 50MB maximum
- **Input Sanitization**: Prevents injection attacks
- **CORS Protection**: Secure cross-origin requests

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes on ports 3000 or 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**Dependencies Issues:**
```bash
# Clean install
rm -rf node_modules frontend/node_modules
npm run install:all
```

**Build Issues:**
```bash
# Clear cache and rebuild
cd frontend
npm start -- --reset-cache
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **React Team** - Amazing framework
- **Material-UI** - Beautiful component library  
- **PapaParse** - CSV parsing capabilities
- **Express.js** - Robust backend framework

---

**Happy CSV Managing!** 📊✨

**Need Help?** Check the troubleshooting section or create an issue in the repository.

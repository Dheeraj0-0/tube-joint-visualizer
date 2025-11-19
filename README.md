# 🧩 Tube Joint Visualizer

Interactive 3D desktop application for creating and visualizing rectangular/square tube joints at various angles.

## ✨ Features

- ✅ Create square and rectangular tubes with custom dimensions
- ✅ Interactive 3D visualization powered by Three.js
- ✅ Joint creation at multiple angles (30°, 45°, 90°, 135°, or custom)
- ✅ Wireframe and solid view toggle
- ✅ Visual joint highlighting with indicators
- ✅ Multiple tube assembly support
- ✅ Intuitive camera controls (orbit, zoom, pan)
- ✅ Undo/redo functionality
- ✅ Cross-platform desktop application (Windows, macOS, Linux)

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16.0.0 or higher
- **npm** v7.0.0 or higher

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/tube-joint-visualizer.git
cd tube-joint-visualizer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run in development mode:**
```bash
npm run electron-dev
```

The application will start in development mode with hot-reloading enabled.

## 📦 Building the Application

### Create Production Build

To build the application for your current platform:
```bash
npm run build:electron
```

### Platform-Specific Builds

**Windows:**
```bash
npm run build:electron -- --win
```
Output: `dist/Tube Joint Visualizer Setup X.X.X.exe`

**macOS:**
```bash
npm run build:electron -- --mac
```
Output: `dist/Tube Joint Visualizer-X.X.X.dmg`

**Linux:**
```bash
npm run build:electron -- --linux
```
Output: `dist/Tube-Joint-Visualizer-X.X.X.AppImage`

**All Platforms:**
```bash
npm run dist
```

## 🎮 Usage Guide

### Basic Controls

| Action | Control |
|--------|---------|
| Rotate Camera | Middle Mouse Button or Shift + Left Click + Drag |
| Zoom In/Out | Mouse Wheel or Zoom Buttons |
| Add Standalone Tube | "Add Tube" button |
| Add Jointed Tube | "Add Jointed Tube" button |
| Toggle Wireframe | "Toggle Wireframe" button |
| Clear Scene | "Clear All" button |

### Creating Tube Assemblies

1. **Select Tube Type:**
   - Choose between Square or Rectangular tubes

2. **Set Dimensions:**
   - **Width:** Tube width in millimeters (10-200mm)
   - **Height:** Tube height for rectangular type (10-200mm)
   - **Thickness:** Wall thickness (1-20mm)
   - **Length:** Tube length (50-500mm)

3. **Configure Joint Angle:**
   - Select preset angles: 30°, 45°, 90°, 135°
   - Or use the slider for custom angles (0-180°)

4. **Add Tubes:**
   - Click "Add Tube" for a standalone tube
   - Click "Add Jointed Tube" to connect to the previous tube

5. **Visualize:**
   - Yellow spheres indicate joint locations
   - Blue tubes are standalone
   - Red tubes are jointed connections
   - Toggle wireframe mode for detailed geometry view

## 🏗️ Project Structure
```
tube-joint-visualizer/
├── public/              # Static assets and HTML template
│   └── index.html       # Main HTML file
├── src/                 # React source code
│   ├── App.jsx          # Root component
│   ├── index.jsx        # Application entry point
│   ├── index.css        # Global styles
│   └── TubeJointVisualizer.jsx  # Main application component
├── electron/            # Electron configuration
│   └── main.js          # Electron main process
├── build/               # Production build output (generated)
├── dist/                # Packaged executables (generated)
├── package.json         # Project dependencies and scripts
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## 🛠️ Technologies Used

- **React 18** - UI framework
- **Three.js r128** - 3D graphics library
- **Electron 28** - Desktop application framework
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first CSS framework


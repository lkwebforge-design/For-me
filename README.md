# Cascadia Depth — Scroll-Velocity Alpine Video & Scene Study

A high-fidelity interactive web application featuring a scroll-velocity-driven background video reconstruction of an alpine sunset landscape, smoothly transitioning from farthest horizon peaks to nearest foreground wildlife, with comprehensive scene telemetry, depth layers, and image-derived colorimetry.

## ✨ Features

- **7-Stage Depth Emergence Video**:
  - `Plane 01 (4,800m)`: Zenith Sky & Golden Horizon Cloud Strata
  - `Plane 02 (3,200m)`: Faceted Alpenglow Summit Massif & Snow Cap
  - `Plane 03 (1,850m)`: Slate-Blue Foothills & Valley Mist Treeline
  - `Plane 04 (920m)`: S-Curve Glacial River & Sunlit Meadows
  - `Plane 05 (380m)`: Right-Bank Spruce Grove & Alluvial Boulders
  - `Plane 06 (65m)`: Terracotta Diagonal Ridge & Framing Sentinel Pines
  - `Plane 07 (18m)`: Foreground Stag Silhouette with Golden Antlers
- **Scroll-Velocity Responsive Engine**:
  - Instantaneous scroll velocity modulates playback rate dynamically (from `0.25x` ambient drift up to `3.60x` velocity surge).
  - Real-time speedometer HUD with live velocity meter (`px/s`), speed presets, and layer scrubber.
- **Client-Side WebM Video Compiler**:
  - In-browser 60fps canvas stream recording and downloadable `.webm` video generation.
- **Project Details & Image Architecture**:
  - Dynamic Bento Study Grid with fullscreen optical lightbox viewer.
  - Interactive 7-Plane Layer Inspector with elevation offsets and polygon metrics.
  - Atmospheric & geological colorimetry palette with click-to-copy hex swatches.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Installation

```bash
# Clone the repository
git clone https://github.com/lkwebforge-design/For-me.git
cd For-me

# Install dependencies
npm install

# Start the local development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠 Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **HTML5 Canvas 60fps Motion Engine**
- **Lucide Icons**

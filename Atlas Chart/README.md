# Atlas - Architecture Explorer

A modern, canvas-first architecture visualization tool inspired by Visio and Lucidchart, built for the web. Atlas provides an intuitive way to explore and document system architectures with focus-centric radial layouts, multiple viewing modes, and full editing capabilities.

## ✨ Features

### 🎯 Core Functionality
- **Infinite Canvas**: Smooth pan, zoom, and navigation with React Flow
- **Focus-Centric Viewing**: Radial layout with context rings for system exploration
- **Multiple Scene Types**: Overview, Data Flows, By Domain, By Status
- **Full Editing Mode**: Visio-style tools for creating and modifying architectures
- **Real-time Search**: Fuzzy search with command palette (Cmd/Ctrl+K)
- **Deep Linking**: Shareable URLs with focus and camera state

### 🎨 Visual Design
- **Forbion-Inspired Styling**: Clean, editorial design with deep blue accents
- **Status Indicators**: Visual rings for planned/building/live/at-risk systems
- **Domain Grouping**: Color-coded domain tints and frames
- **Responsive Layout**: Works flawlessly on ultrawide monitors and laptops
- **Fullscreen Support**: Native fullscreen API with smart resize handling

### 📊 Data Management
- **Import/Export**: JSON and CSV import, JSON/PNG/SVG/PDF export
- **Validation**: Zod-based schema validation with detailed error reporting
- **Real-time Editing**: Live updates with undo/redo support
- **Auto-save**: Draft persistence with publish workflow

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support with intuitive shortcuts
- **Screen Reader Support**: ARIA labels and semantic markup
- **High Contrast**: Automatic high contrast mode detection
- **Reduced Motion**: Respects user motion preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd atlas-chart

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📖 Usage Guide

### Viewing Mode (Default)

**Navigation:**
- **Click** any system to focus on it
- **Pan** by dragging the canvas
- **Zoom** with mouse wheel or trackpad
- **Search** with Cmd/Ctrl+K

**Scene Types:**
- **Overview**: Focus-centric radial layout
- **Data Flows**: Left-to-right flow visualization  
- **By Domain**: Grouped by business domain
- **By Status**: Swimlanes by system status

**Keyboard Shortcuts:**
- `↑↓←→` Navigate between connected systems
- `Enter` Open/expand selected system
- `Esc` Close panels or collapse focus
- `Cmd/Ctrl+K` Open command palette
- `Cmd/Ctrl+1` Fit view to content
- `Cmd/Ctrl+0` Reset camera
- `F11` Toggle fullscreen

### Editing Mode

**Tools:**
- **Select Tool**: Move and select systems
- **Connect Tool**: Create relationships between systems
- **Node Tools**: Add different system types
- **Shape Tools**: Modify node appearances

**System Types:**
- **App**: Frontend applications
- **Service**: Backend services and APIs
- **Data Store**: Databases and storage systems
- **Queue**: Message queues and event streams
- **External**: Third-party systems and APIs

## 📋 Data Schema

### System Object

```typescript
interface System {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: 'app' | 'service' | 'datastore' | 'queue' | 'external';
  domain: string;                // Business domain
  team?: string;                 // Owning team
  owner?: string;                // System owner
  status: 'planned' | 'building' | 'live' | 'risk';
  description?: string;          // System description
  features?: string[];           // Key features list
  tags?: string[];              // Categorization tags
  dependencies?: Dependency[];   // System dependencies
  planned?: Timeline;           // Planned timeline
  actual?: Timeline;            // Actual timeline
  links?: Link[];               // External links
  colorOverride?: string;       // Custom color
}
```

### Dependency Object

```typescript
interface Dependency {
  targetId: string;             // Target system ID
  kind?: 'sync' | 'async' | 'event' | 'batch' | 'other';
  note?: string;                // Relationship description
}
```

### Link Object

```typescript
interface Link {
  label: string;                // Link display name
  url: string;                  // Link URL
  kind?: 'docs' | 'repo' | 'runbook' | 'dashboard' | 'other';
}
```

## 🔧 Import/Export

### JSON Format

```json
{
  "systems": [
    {
      "id": "user-service",
      "name": "User Service",
      "type": "service",
      "domain": "Identity",
      "team": "Backend Team",
      "owner": "John Doe",
      "status": "live",
      "description": "Handles user authentication and profiles",
      "features": ["OAuth 2.0", "JWT tokens", "User profiles"],
      "tags": ["backend", "auth", "microservice"],
      "links": [
        {
          "label": "API Documentation",
          "url": "https://api.example.com/docs",
          "kind": "docs"
        }
      ]
    }
  ],
  "edges": [
    {
      "id": "app-user-service",
      "source": "web-app",
      "target": "user-service",
      "kind": "sync",
      "note": "User authentication"
    }
  ]
}
```

### CSV Format

CSV files should include columns for all system properties. Array fields (features, tags, links, dependencies) should be JSON-formatted strings.

Example CSV columns:
- `id`, `name`, `type`, `domain`, `team`, `owner`, `status`
- `description`, `features`, `tags`, `dependencies`, `links`
- `planned_start`, `planned_end`, `actual_start`, `actual_goLive`

## 🎨 Customization

### Theme Variables

The application uses CSS custom properties for theming:

```css
:root {
  --bg: #ffffff;                    /* Background color */
  --text: #0b0f1a;                 /* Primary text */
  --muted: #6b7280;                /* Secondary text */
  --primary: #12325B;              /* Primary accent */
  --primary-ink: #0E2746;          /* Darker primary */
  --line: #E7EBF0;                 /* Borders and lines */
  
  /* Status colors */
  --ring-live: #1f7a4d;
  --ring-building: #1b5fbf;
  --ring-planned: #b88a1a;
  --ring-risk: #b91c1c;
}
```

### Custom Node Types

Extend the system types by modifying the `SystemType` union in `src/lib/types.ts` and updating the icon mappings in components.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run end-to-end tests
npm run test:e2e

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Flow** - Canvas and graph visualization
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Zod** - Schema validation
- **Fuse.js** - Fuzzy search
- **Vite** - Build tool and dev server

### Project Structure

```
src/
├── components/          # React components
│   ├── GraphView.tsx   # System node component
│   ├── EdgeShape.tsx   # Connection edge component
│   ├── DetailCard.tsx  # System details panel
│   ├── SceneToolbar.tsx # Scene selection
│   ├── Breadcrumbs.tsx # Navigation breadcrumbs
│   ├── CommandPalette.tsx # Search interface
│   ├── MenuBar.tsx     # File operations
│   └── ...
├── store/              # State management
│   └── useAtlasStore.ts
├── lib/                # Utilities and helpers
│   ├── types.ts        # TypeScript definitions
│   ├── validation.ts   # Zod schemas
│   ├── simpleLayouts.ts # Layout algorithms
│   └── importExport.ts # I/O operations
├── pages/              # Page components
│   ├── Viewer.tsx      # Viewing mode
│   └── Editor.tsx      # Editing mode
└── data/               # Example data
    └── systems.example.json
```

## 🚀 Performance

Atlas is optimized for large architectures:

- **Smooth Performance**: Handles 150+ nodes and 300+ edges
- **Virtual Rendering**: Efficient rendering for large datasets
- **Memoization**: Optimized React components
- **Lazy Loading**: On-demand component loading
- **Debounced Updates**: Efficient state updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Forbion** - Design inspiration for the clean, editorial aesthetic
- **React Flow** - Excellent graph visualization library
- **Tailwind CSS** - Rapid UI development framework
- **Lucidchart & Visio** - Inspiration for architecture visualization concepts

---

**Atlas** - Explore your architecture like never before. 🗺️✨



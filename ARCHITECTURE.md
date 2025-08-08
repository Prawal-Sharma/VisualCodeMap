# Architecture Overview

## System Design

Visual Code Map is built as a VS Code extension that combines static code analysis with interactive visualization. The architecture follows a modular design with clear separation of concerns.

## Core Components

### 1. Extension Host (Main Process)
- **Location**: `src/extension.ts`
- **Responsibilities**:
  - Extension activation and lifecycle management
  - Command registration and handling
  - Webview panel creation and management
  - File system watching for real-time updates

### 2. Code Parser Module
- **Location**: `src/parser/`
- **Technology**: ts-morph (TypeScript Compiler API wrapper)
- **Responsibilities**:
  - AST generation from source files
  - Import/export extraction
  - Function call analysis
  - Symbol resolution
  - Module system detection (ES6, CommonJS, AMD)

### 3. Dependency Analyzer
- **Location**: `src/analyzer/`
- **Responsibilities**:
  - Build dependency graph from parsed data
  - Detect circular dependencies
  - Calculate coupling metrics
  - Identify orphaned files
  - Generate file relationship matrix

### 4. Graph Generator
- **Location**: `src/graph/`
- **Data Structure**:
  ```typescript
  interface GraphNode {
    id: string;
    path: string;
    type: 'file' | 'directory' | 'external';
    metrics: NodeMetrics;
  }
  
  interface GraphEdge {
    source: string;
    target: string;
    type: 'import' | 'export' | 'dynamic';
    weight: number;
  }
  ```
- **Responsibilities**:
  - Convert dependency data to graph format
  - Apply layout algorithms
  - Optimize for rendering performance
  - Handle incremental updates

### 5. Webview UI
- **Location**: `src/webview/`
- **Technology**: React + D3.js/Cytoscape.js
- **Components**:
  - Graph renderer
  - Control panel
  - Search interface
  - Filter controls
  - Export dialog
- **Communication**: PostMessage API with extension host

## Data Flow

```
Source Files → Parser → Analyzer → Graph Generator → Webview
     ↑                                                    ↓
     └──────────── File System Watcher ←─────────────────┘
```

1. **Parsing Phase**:
   - Read source files from workspace
   - Generate AST for each file
   - Extract dependency information
   - Cache parsed results

2. **Analysis Phase**:
   - Build complete dependency graph
   - Calculate graph metrics
   - Identify patterns and issues
   - Prepare visualization data

3. **Rendering Phase**:
   - Send graph data to webview
   - Apply force-directed layout
   - Render interactive visualization
   - Handle user interactions

## Performance Strategies

### Lazy Loading
- Parse files on-demand for large repositories
- Progressive graph building
- Virtualized rendering for many nodes

### Caching
- File-level AST cache with content hashing
- Dependency graph cache between sessions
- Layout position cache for stable visualization

### Optimization Techniques
- Web Workers for heavy computations
- Incremental updates on file changes
- Debounced file system events
- Graph simplification for overview mode

## Extension API Integration

### Commands
- `visualCodeMap.generate`: Generate new code map
- `visualCodeMap.refresh`: Refresh current map
- `visualCodeMap.export`: Export visualization
- `visualCodeMap.filter`: Apply filters

### Configuration
- Workspace-specific settings
- User preferences
- Extension state persistence

### File System
- VS Code workspace API for file access
- File watchers for real-time updates
- Virtual file system support

## Security Considerations

- No external network requests
- Sandboxed webview execution
- Content Security Policy enforcement
- Safe path handling and validation

## Testing Architecture

### Unit Tests
- Parser accuracy tests
- Graph algorithm tests
- Metric calculation tests

### Integration Tests
- VS Code API integration
- Command execution
- File system operations

### E2E Tests
- Full workflow testing
- User interaction simulation
- Performance benchmarks

## Scalability

### Small Projects (<100 files)
- Full parsing and analysis
- Real-time updates
- All features enabled

### Medium Projects (100-1000 files)
- Selective parsing
- Cached results
- Smart updates

### Large Projects (>1000 files)
- Progressive loading
- Directory-level aggregation
- On-demand expansion
- Background processing

## Future Extensibility

### Language Support
- Plugin architecture for new languages
- Language server protocol integration
- Custom parser adapters

### Visualization Modes
- Tree view
- Matrix view
- 3D visualization
- Timeline view

### Analysis Features
- Code quality metrics
- Complexity analysis
- Test coverage overlay
- Git history integration

## Dependencies

### Core Dependencies
- `vscode`: VS Code Extension API
- `ts-morph`: TypeScript/JavaScript parsing
- `d3` or `cytoscape`: Graph visualization
- `react`: UI framework

### Build Tools
- `webpack` or `esbuild`: Bundling
- `typescript`: Type safety
- `jest`: Testing framework

## Deployment

### Extension Package
- Bundled with webpack
- Minified for production
- Source maps for debugging
- VSIX package generation

### Distribution
- VS Code Marketplace
- GitHub releases
- Manual installation support

---

This architecture is designed to be modular, performant, and extensible while maintaining a focus on developer experience and code understanding.
# Changelog

All notable changes to the Visual Code Map extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2025-01-11

### Added
- **Advanced Search**: Regex support for powerful search patterns
- **Export Functionality**: Export graphs as SVG, PNG, or JSON
- **Interactive Minimap**: Bird's-eye view navigation with click-to-jump
- **Keyboard Shortcuts**: Comprehensive shortcuts for all major actions
- **Help Dialog**: In-app help with keyboard shortcuts guide
- **Dependency Visualization**: Line thickness and color based on import count and type
- **Search Results Panel**: Clickable results for quick navigation
- **Link Tooltips**: Hover over dependencies to see detailed information

### Fixed
- **Zoom Controls**: Fixed D3 zoom behavior for smooth zooming
- **Orphaned Files**: Corrected detection algorithm for files with no connections
- **Hierarchical Layout**: Properly organizes files by directory depth
- **Circular Layout**: Smooth transitions with proper link updates
- **Layout Transitions**: All layouts now animate smoothly
- **Show Orphaned Toggle**: Now properly hides/shows orphaned nodes

### Changed
- Enhanced link visualization with color coding by dependency type
- Improved minimap rendering performance
- Better graph update cycle management
- Optimized memory usage for large graphs
- Enhanced visual feedback for all interactions

### Technical Improvements
- Added viewport indicator in minimap
- Implemented proper zoom transform tracking
- Improved node highlighting algorithms
- Better error handling throughout

## [0.1.2] - 2025-01-11

### Fixed
- **Critical Fix**: D3.js library now properly bundled with extension
- Graph visualization now renders correctly 
- All interactive features (zoom, pan, search, layout switching) now work
- Fixed issue where D3 was not included in the published package
- Buttons and controls are now fully functional

### Changed
- D3.js is now bundled directly with webpack instead of loaded separately
- Updated build configuration to use ES6 modules
- Improved initialization sequence for better reliability

## [0.1.1] - 2025-01-11

### Fixed
- Fixed webview resource loading paths - graph now loads correctly
- Fixed webpack configuration to properly bundle D3.js visualization
- Removed conflicting React implementation in favor of pure D3.js
- Fixed missing graph rendering issue
- Improved resource bundling with embedded CSS
- Added proper .vscodeignore file to reduce extension size

### Changed
- Simplified webpack configuration for better reliability
- Embedded styles directly in webview for consistent rendering
- Optimized extension package size

## [0.1.0] - 2024-01-08

### Added
- Initial release of Visual Code Map
- Interactive dependency graph visualization using D3.js
- Support for JavaScript and TypeScript file parsing
- Force-directed, hierarchical, and circular layout options
- Click-to-open file navigation
- Real-time search and filtering capabilities
- Zoom and pan controls
- Node hover information display
- Orphaned file detection
- Circular dependency detection
- Entry point identification
- Dark/light theme support
- Export to JSON and HTML formats
- VS Code workspace integration
- Configurable exclusion patterns
- Cache system for improved performance

### Features
- **Parser**: AST-based parsing using ts-morph
- **Analyzer**: Comprehensive dependency analysis
- **Visualization**: Interactive D3.js graph
- **Navigation**: Direct file opening from graph nodes
- **Search**: Real-time node filtering
- **Layouts**: Multiple graph layout algorithms
- **Themes**: VS Code theme integration

### Technical
- Built with TypeScript
- Webpack bundling
- Jest testing framework
- ESLint code quality checks
- Comprehensive test coverage

### Known Issues
- Large repositories (>10,000 files) may experience slower initial parsing
- Circular dependencies may cause layout irregularities in hierarchical view

## [Unreleased]

### Planned Features
- Support for additional languages (Python, Java, C++)
- PNG and SVG export functionality
- Dependency metrics and statistics
- Code complexity visualization
- Git integration for change tracking
- Multi-root workspace support
- Custom color schemes
- Performance improvements for large codebases

---

For more information, visit the [GitHub repository](https://github.com/Prawal-Sharma/VisualCodeMap)
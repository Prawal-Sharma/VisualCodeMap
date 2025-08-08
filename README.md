# Visual Code Map

A VS Code extension that generates interactive visual maps of your codebase, showing file dependencies and module relationships to help developers understand and navigate large projects.

## Features

- **Interactive Dependency Graph**: Visualize how files and modules connect in your project
- **Smart Code Analysis**: Automatically parse JavaScript/TypeScript files to extract imports, exports, and function calls
- **Live Navigation**: Click on any node to open the corresponding file in VS Code
- **Powerful Filtering**: Filter by directory, file type, or custom patterns
- **Multiple Export Formats**: Export your code map as PNG, SVG, or JSON
- **Performance Optimized**: Handles medium to large codebases efficiently with lazy loading

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Visual Code Map"
4. Click Install

### From Source
```bash
git clone https://github.com/Prawal-Sharma/VisualCodeMap.git
cd VisualCodeMap
npm install
npm run compile
```

## Usage

1. Open a project in VS Code
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run "Visual Code Map: Generate Code Map"
4. The interactive graph will open in a new panel

### Navigation Controls
- **Click**: Select a node and open file
- **Drag**: Pan around the graph
- **Scroll**: Zoom in/out
- **Right-click**: Context menu with additional options

### Filtering Options
- Filter by directory: Focus on specific parts of your codebase
- Filter by file type: Show only `.ts`, `.js`, `.jsx`, etc.
- Hide external dependencies: Focus on your code only
- Search: Find specific files or modules

## Supported Languages

Currently supports:
- JavaScript (.js, .mjs)
- TypeScript (.ts, .tsx)
- React/JSX (.jsx, .tsx)

## Configuration

Configure Visual Code Map in VS Code settings:

```json
{
  "visualCodeMap.maxDepth": 10,
  "visualCodeMap.excludePatterns": ["node_modules", "dist", "build"],
  "visualCodeMap.colorScheme": "default",
  "visualCodeMap.showOrphanedFiles": false,
  "visualCodeMap.layout": "force-directed"
}
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for setup instructions and contribution guidelines.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details about the extension's design.

## Requirements

- VS Code 1.74.0 or higher
- Node.js 16.x or higher (for development)

## Known Issues

- Large repositories (>10,000 files) may take longer to analyze
- Circular dependencies are detected but may cause layout issues

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](DEVELOPMENT.md#contributing) before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

Inspired by tools like CodeSee and CodeViz, built to be lightweight, local, and open-source.

## Support

- Report issues on [GitHub Issues](https://github.com/Prawal-Sharma/VisualCodeMap/issues)
- Read the [documentation](https://github.com/Prawal-Sharma/VisualCodeMap/wiki)

---

Built with focus on developer experience and codebase understanding.
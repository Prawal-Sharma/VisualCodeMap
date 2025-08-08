# Visual Code Map - Interactive Dependency Visualization

Transform your codebase into an interactive visual map! Visual Code Map helps developers understand complex JavaScript/TypeScript projects by creating beautiful, navigable dependency graphs.

## ✨ Features

### 🔍 Smart Code Analysis
- **Automatic Parsing**: Analyzes JavaScript and TypeScript files
- **Import Detection**: Tracks ES6 imports, CommonJS requires, and dynamic imports
- **Circular Dependencies**: Identifies and highlights circular dependencies
- **Orphaned Files**: Finds files that aren't imported anywhere

### 🎨 Interactive Visualization
- **Force-Directed Graph**: Dynamic layout that adapts to your codebase structure
- **Multiple Layouts**: Switch between force-directed, hierarchical, and circular views
- **Zoom & Pan**: Navigate large codebases with smooth controls
- **Click to Open**: Click any node to open the file in VS Code

### 🔧 Powerful Controls
- **Real-time Search**: Find files instantly as you type
- **Filter Options**: Hide/show orphaned files, filter by directory
- **Theme Support**: Automatically matches your VS Code theme
- **Export Data**: Export graph as JSON or HTML

## 🚀 Quick Start

1. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. **Run** "Visual Code Map: Generate Code Map"
3. **Explore** your codebase visually!

## 📊 Graph Elements

- **Blue Nodes**: TypeScript files
- **Yellow Nodes**: JavaScript files
- **Cyan Nodes**: React/JSX files
- **Green Nodes**: Entry points
- **Red Nodes**: Orphaned files
- **Gray Edges**: Import relationships

## ⚙️ Configuration

Customize Visual Code Map in VS Code settings:

```json
{
  "visualCodeMap.maxDepth": 10,
  "visualCodeMap.excludePatterns": ["node_modules", "dist"],
  "visualCodeMap.colorScheme": "default",
  "visualCodeMap.showOrphanedFiles": false
}
```

## 🎯 Perfect For

- **Onboarding**: Help new team members understand your codebase
- **Refactoring**: Identify tightly coupled modules
- **Documentation**: Generate visual architecture diagrams
- **Code Reviews**: See the impact of changes visually
- **Legacy Code**: Understand complex, undocumented systems

## 💡 Pro Tips

- Use `Ctrl+Scroll` to zoom in/out
- Double-click nodes to focus on their connections
- Use the search bar to highlight specific modules
- Export to JSON for custom analysis tools

## 🔧 Requirements

- VS Code 1.74.0 or higher
- JavaScript or TypeScript project

## 📝 Supported File Types

- `.js` - JavaScript
- `.jsx` - React JSX
- `.ts` - TypeScript
- `.tsx` - React TSX
- `.mjs` - ES Modules

## 🐛 Known Issues

- Large repositories (>10,000 files) may take longer to analyze
- Circular dependencies might cause layout irregularities

## 📖 Learn More

- [GitHub Repository](https://github.com/Prawal-Sharma/VisualCodeMap)
- [Report Issues](https://github.com/Prawal-Sharma/VisualCodeMap/issues)
- [Documentation](https://github.com/Prawal-Sharma/VisualCodeMap/wiki)

## 🤝 Contributing

Contributions are welcome! Please check our [GitHub repository](https://github.com/Prawal-Sharma/VisualCodeMap) for guidelines.

## 📄 License

MIT © Prawal Sharma

---

**Enjoy exploring your code visually!** 🎉
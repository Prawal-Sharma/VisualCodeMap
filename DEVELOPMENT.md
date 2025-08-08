# Development Guide

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- VS Code 1.74.0 or higher
- Git

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Prawal-Sharma/VisualCodeMap.git
cd VisualCodeMap
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Extension
```bash
npm run compile
```

### 4. Run in Development Mode
1. Open the project in VS Code
2. Press `F5` to launch a new VS Code window with the extension loaded
3. Open a JavaScript/TypeScript project in the new window
4. Run "Visual Code Map: Generate Code Map" from the Command Palette

## Project Structure

```
VisualCodeMap/
├── src/
│   ├── extension.ts           # Main extension entry point
│   ├── commands/               # Command handlers
│   │   ├── generateMap.ts
│   │   ├── refreshMap.ts
│   │   └── exportMap.ts
│   ├── parser/                 # Code parsing logic
│   │   ├── index.ts
│   │   ├── tsParser.ts
│   │   └── jsParser.ts
│   ├── analyzer/               # Dependency analysis
│   │   ├── index.ts
│   │   ├── graphBuilder.ts
│   │   └── metrics.ts
│   ├── graph/                  # Graph generation
│   │   ├── index.ts
│   │   ├── layout.ts
│   │   └── optimizer.ts
│   ├── webview/                # UI components
│   │   ├── index.html
│   │   ├── app.tsx
│   │   ├── components/
│   │   └── styles/
│   └── utils/                  # Utility functions
│       ├── cache.ts
│       ├── fileSystem.ts
│       └── logger.ts
├── test/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── resources/                  # Static resources
├── .vscode/                    # VS Code configuration
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Development Workflow

### Building

```bash
# Development build with watch mode
npm run watch

# Production build
npm run compile

# Bundle for distribution
npm run package
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- parser.test.ts
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format with Prettier
npm run format

# Type checking
npm run typecheck
```

### Debugging

1. Set breakpoints in VS Code
2. Press `F5` to start debugging
3. Use Debug Console for inspection
4. Check Extension Host logs in Output panel

#### Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ]
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/test"
      ]
    }
  ]
}
```

## Code Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer interfaces over type aliases for objects
- Use enums for fixed sets of values
- Document complex types with JSDoc

### Naming Conventions
- Files: camelCase (e.g., `graphBuilder.ts`)
- Classes: PascalCase (e.g., `DependencyAnalyzer`)
- Functions/Variables: camelCase (e.g., `parseFile`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_DEPTH`)
- Interfaces: PascalCase with 'I' prefix (e.g., `IGraphNode`)

### Code Style
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Max line length: 100 characters
- Add trailing commas in multiline structures

### Git Commit Messages
Follow conventional commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tool changes

Example:
```
feat(parser): add support for dynamic imports

- Parse dynamic import() expressions
- Handle async module loading
- Update tests for new functionality
```

## Testing Guidelines

### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Aim for >80% code coverage
- Use descriptive test names

### Integration Tests
- Test component interactions
- Test VS Code API integration
- Use real file fixtures when possible

### Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Test implementation
    });

    it('should throw error for invalid input', () => {
      // Test implementation
    });
  });
});
```

## Performance Considerations

### Optimization Checklist
- [ ] Profile code with Chrome DevTools
- [ ] Minimize AST traversals
- [ ] Cache expensive computations
- [ ] Use Web Workers for heavy processing
- [ ] Implement virtual scrolling for large graphs
- [ ] Debounce file system events
- [ ] Lazy load visualization libraries

### Benchmarking
```bash
# Run performance benchmarks
npm run benchmark

# Profile specific operation
npm run profile -- --operation=parse
```

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add/update tests
5. Update documentation
6. Ensure all tests pass
7. Commit with conventional commit message
8. Push to your fork
9. Open a Pull Request

### PR Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Lint and format checks pass
- [ ] Type checking passes
- [ ] Changelog updated
- [ ] Screenshots added (for UI changes)

### Code Review Guidelines
- Be constructive and respectful
- Focus on code quality and maintainability
- Consider performance implications
- Ensure consistency with existing code
- Verify test coverage

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run full test suite
4. Build production bundle
5. Create GitHub release
6. Publish to VS Code Marketplace

```bash
# Bump version
npm version patch|minor|major

# Create release package
npm run package

# Publish to marketplace
vsce publish
```

## Troubleshooting

### Common Issues

#### Extension not loading
- Check VS Code version compatibility
- Verify all dependencies are installed
- Check console for error messages
- Clear extension cache

#### Parser errors
- Ensure TypeScript version compatibility
- Check for syntax errors in target files
- Verify file encoding (UTF-8)

#### Performance issues
- Reduce max depth setting
- Exclude large directories
- Enable caching
- Check memory usage

### Debug Logging

Enable verbose logging:
```json
{
  "visualCodeMap.debug": true,
  "visualCodeMap.logLevel": "verbose"
}
```

Check logs in:
- Output Panel → "Visual Code Map"
- Developer Console (Help → Toggle Developer Tools)

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [ts-morph Documentation](https://ts-morph.com/)
- [D3.js Documentation](https://d3js.org/)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/Prawal-Sharma/VisualCodeMap/issues)
- Discussions: [Ask questions or share ideas](https://github.com/Prawal-Sharma/VisualCodeMap/discussions)

---

Happy coding! Remember to test progressively and maintain code quality throughout development.
# Development Context & Guidelines

## Project Overview
Visual Code Map is a VS Code extension that generates interactive visual maps of codebases, showing file dependencies and module relationships. The goal is to help developers understand and navigate large projects through visualization.

## Current Development Status

### Progress Tracking
**Current Phase**: Phase 1 - Project Setup & Documentation
**Last Updated**: Initial Setup

#### Completed Features
- [x] Project documentation (README, ARCHITECTURE, DEVELOPMENT)
- [x] Development context documentation (CLAUDE.md)
- [ ] Git repository initialization
- [ ] GitHub remote connection
- [ ] VS Code extension boilerplate
- [ ] Testing framework setup
- [ ] Parser implementation
- [ ] Analyzer implementation
- [ ] Graph visualization
- [ ] Interactive features
- [ ] Export functionality
- [ ] Performance optimization

#### In Progress
- Setting up Git repository and GitHub connection

#### Next Steps
1. Initialize Git repository
2. Connect to GitHub remote
3. Create VS Code extension boilerplate
4. Set up TypeScript and build pipeline
5. Implement testing framework

#### Known Issues & Blockers
- None currently

#### Technical Decisions Made
- Using ts-morph for AST parsing
- D3.js or Cytoscape.js for visualization (final decision pending)
- TypeScript for type safety
- Jest for testing framework
- Webpack or esbuild for bundling (final decision pending)

## Development Guidelines

### Progressive Testing Requirements
**CRITICAL**: Every feature must be tested progressively as it's built. This is non-negotiable.

#### Testing Strategy
1. **Before Implementation**: Write test cases for the feature
2. **During Implementation**: Run tests frequently to validate progress
3. **After Implementation**: Ensure all tests pass before moving on
4. **Before Commit**: Run full test suite

#### Test Coverage Requirements
- Minimum 80% code coverage
- 100% coverage for critical paths (parser, analyzer)
- All edge cases must be tested
- Performance benchmarks for operations over 100ms

#### Test Types Required
- **Unit Tests**: Every function/class method
- **Integration Tests**: Component interactions
- **E2E Tests**: User workflows
- **Performance Tests**: Large codebase handling
- **Visual Tests**: UI component rendering

### Session Documentation

#### Session Start Checklist
- [ ] Review this CLAUDE.md file
- [ ] Check current development status
- [ ] Review last session's work
- [ ] Identify next tasks
- [ ] Update todo list

#### During Development
- Update progress section after each feature
- Document any architectural decisions
- Note workarounds or technical debt
- Track new dependencies added
- Record performance metrics
- Run tests after each change

#### Session End Checklist
- [ ] Update current status section
- [ ] Document completed work
- [ ] Note any blockers or issues
- [ ] Update next steps
- [ ] Commit changes with descriptive message
- [ ] Push to GitHub

### Commit Guidelines

#### Commit Message Format
```
<type>(<scope>): <description>

<detailed explanation if needed>

Progress: <what was completed>
Next: <what comes next>
Tests: <test status>
```

#### Commit Frequency
- After each completed feature
- When switching context
- Before ending a session
- Never commit broken code
- Always include test results

### Code Quality Standards

#### Before Writing Code
1. Check existing patterns in codebase
2. Verify library availability
3. Review architecture decisions
4. Plan test cases

#### While Writing Code
1. Follow existing code style
2. Use TypeScript strict mode
3. Add no comments unless complex algorithm
4. Keep functions small and focused
5. Test as you code

#### After Writing Code
1. Run linter (`npm run lint`)
2. Run type checker (`npm run typecheck`)
3. Run tests (`npm test`)
4. Check performance impact
5. Update documentation if needed

### Performance Guidelines

#### Benchmarks to Maintain
- Parse 100 files: <1 second
- Parse 1000 files: <10 seconds
- Generate graph for 100 nodes: <500ms
- Render 1000 nodes: <2 seconds
- File navigation response: <100ms

#### Optimization Priorities
1. Parsing speed
2. Memory usage
3. Rendering performance
4. Cache effectiveness
5. Bundle size

### Architecture Principles

#### Design Patterns
- Separation of concerns
- Single responsibility
- Dependency injection
- Observer pattern for updates
- Factory pattern for parsers

#### Module Boundaries
- Parser: Only parsing, no analysis
- Analyzer: Only analysis, no visualization
- Graph: Only data structure, no rendering
- Webview: Only UI, no business logic

### VS Code Extension Best Practices

#### Activation
- Lazy activation when possible
- Minimal activation time (<500ms)
- Clear activation events

#### Resource Management
- Dispose resources properly
- Clean up event listeners
- Clear caches on deactivation
- Handle workspace changes

#### User Experience
- Immediate visual feedback
- Progress indicators for long operations
- Clear error messages
- Intuitive controls

## Dependencies & Versions

### Core Dependencies
- `vscode`: ^1.74.0
- `typescript`: ^5.0.0
- `ts-morph`: ^21.0.0
- `react`: ^18.0.0 (for webview)
- `d3` or `cytoscape`: TBD

### Dev Dependencies
- `jest`: ^29.0.0
- `@types/vscode`: ^1.74.0
- `eslint`: ^8.0.0
- `prettier`: ^3.0.0
- `webpack` or `esbuild`: TBD

## File Organization

### Naming Conventions
- Files: camelCase
- Components: PascalCase
- Tests: `*.test.ts` or `*.spec.ts`
- Interfaces: `I` prefix
- Types: `T` suffix

### Directory Structure Rules
- One component per file
- Tests alongside source files
- Shared types in `types/` directory
- Utils must be pure functions

## Security Considerations

### Never Do
- Log sensitive information
- Make network requests without user consent
- Access files outside workspace
- Execute arbitrary code
- Store credentials

### Always Do
- Validate file paths
- Sanitize user input
- Use CSP in webviews
- Handle errors gracefully
- Request minimal permissions

## Performance Tracking

### Metrics to Track
- Parse time per file
- Total analysis time
- Graph generation time
- Rendering frame rate
- Memory usage
- Cache hit rate

### How to Measure
```typescript
const startTime = performance.now();
// ... operation ...
const duration = performance.now() - startTime;
console.log(`Operation took ${duration}ms`);
```

## Debugging Tips

### Common Issues
1. **Extension not activating**: Check activation events
2. **Parser failing**: Verify TypeScript version
3. **Graph not rendering**: Check webview CSP
4. **Performance issues**: Profile with DevTools
5. **Memory leaks**: Check disposables

### Debug Commands
```bash
# Watch extension logs
Developer: Show Logs...

# Reload window
Developer: Reload Window

# Open webview developer tools
Developer: Open Webview Developer Tools
```

## Next Session Reminders

When returning to this project:
1. Read this entire CLAUDE.md file
2. Check git status and recent commits
3. Review test results
4. Check GitHub issues
5. Update progress tracking
6. Continue from "Next Steps" section

## Important Notes

- **Always test before committing**
- **Update this file after each session**
- **Never skip the testing phase**
- **Document decisions as they're made**
- **Keep commits focused and atomic**
- **Maintain backwards compatibility**
- **Consider performance in every change**

---

Remember: Quality over speed. Test everything. Document progress.
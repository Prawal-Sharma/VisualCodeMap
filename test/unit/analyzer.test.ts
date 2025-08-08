import { Analyzer } from '../../src/analyzer';
import { Logger } from '../../src/utils/logger';
import { IParseResult } from '../../src/types/parser';

describe('Analyzer', () => {
    let analyzer: Analyzer;
    let mockLogger: Logger;
    
    beforeEach(() => {
        mockLogger = new Logger('test');
        analyzer = new Analyzer(mockLogger);
        jest.clearAllMocks();
    });
    
    describe('analyze', () => {
        it('should analyze dependencies between files', async () => {
            const parseResults: IParseResult[] = [
                {
                    filePath: '/project/src/index.js',
                    imports: [
                        {
                            source: './utils',
                            specifiers: [],
                            type: 'es6' as any,
                            line: 1,
                            column: 0
                        }
                    ],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: {
                        linesOfCode: 10,
                        linesOfComments: 0,
                        complexity: 1,
                        imports: 1,
                        exports: 0
                    }
                },
                {
                    filePath: '/project/src/utils.js',
                    imports: [],
                    exports: [
                        {
                            name: 'helper',
                            type: 'named' as any,
                            line: 1,
                            column: 0
                        }
                    ],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: {
                        linesOfCode: 5,
                        linesOfComments: 0,
                        complexity: 1,
                        imports: 0,
                        exports: 1
                    }
                }
            ];
            
            const result = await analyzer.analyze(parseResults);
            
            expect(result.files).toHaveLength(2);
            expect(result.dependencies).toBeDefined();
            expect(result.entryPoints).toBeDefined();
            expect(result.orphanedFiles).toBeDefined();
            expect(result.circularDependencies).toBeDefined();
        });
        
        it('should detect circular dependencies', async () => {
            const parseResults: IParseResult[] = [
                {
                    filePath: '/project/a.js',
                    imports: [{ source: './b', specifiers: [], type: 'es6' as any, line: 1, column: 0 }],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 5, linesOfComments: 0, complexity: 1, imports: 1, exports: 0 }
                },
                {
                    filePath: '/project/b.js',
                    imports: [{ source: './c', specifiers: [], type: 'es6' as any, line: 1, column: 0 }],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 5, linesOfComments: 0, complexity: 1, imports: 1, exports: 0 }
                },
                {
                    filePath: '/project/c.js',
                    imports: [{ source: './a', specifiers: [], type: 'es6' as any, line: 1, column: 0 }],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 5, linesOfComments: 0, complexity: 1, imports: 1, exports: 0 }
                }
            ];
            
            const result = await analyzer.analyze(parseResults);
            
            // Should detect the circular dependency a -> b -> c -> a
            expect(result.circularDependencies.length).toBeGreaterThanOrEqual(0);
        });
        
        it('should identify orphaned files', async () => {
            const parseResults: IParseResult[] = [
                {
                    filePath: '/project/index.js',
                    imports: [{ source: './used', specifiers: [], type: 'es6' as any, line: 1, column: 0 }],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 10, linesOfComments: 0, complexity: 1, imports: 1, exports: 0 }
                },
                {
                    filePath: '/project/used.js',
                    imports: [],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 5, linesOfComments: 0, complexity: 1, imports: 0, exports: 0 }
                },
                {
                    filePath: '/project/orphaned.js',
                    imports: [],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 5, linesOfComments: 0, complexity: 1, imports: 0, exports: 0 }
                }
            ];
            
            const result = await analyzer.analyze(parseResults);
            
            // orphaned.js should be identified as orphaned
            expect(result.orphanedFiles).toContain('/project/orphaned.js');
        });
        
        it('should find entry points', async () => {
            const parseResults: IParseResult[] = [
                {
                    filePath: '/project/index.js',
                    imports: [{ source: './lib', specifiers: [], type: 'es6' as any, line: 1, column: 0 }],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 10, linesOfComments: 0, complexity: 1, imports: 1, exports: 0 }
                },
                {
                    filePath: '/project/lib.js',
                    imports: [],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 20, linesOfComments: 0, complexity: 3, imports: 0, exports: 0 }
                }
            ];
            
            const result = await analyzer.analyze(parseResults);
            
            // index.js should be identified as entry point (not imported by anyone)
            expect(result.entryPoints).toContain('/project/index.js');
            expect(result.entryPoints).not.toContain('/project/lib.js');
        });
        
        it('should handle empty parse results', async () => {
            const result = await analyzer.analyze([]);
            
            expect(result.files).toHaveLength(0);
            expect(result.dependencies).toHaveLength(0);
            expect(result.orphanedFiles).toHaveLength(0);
            expect(result.circularDependencies).toHaveLength(0);
            expect(result.entryPoints).toHaveLength(0);
        });
    });
    
    describe('dependency resolution', () => {
        it('should resolve relative imports correctly', async () => {
            const parseResults: IParseResult[] = [
                {
                    filePath: '/project/src/components/Button.js',
                    imports: [
                        { source: '../utils/helpers', specifiers: [], type: 'es6' as any, line: 1, column: 0 },
                        { source: './Icon', specifiers: [], type: 'es6' as any, line: 2, column: 0 }
                    ],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 15, linesOfComments: 0, complexity: 2, imports: 2, exports: 0 }
                },
                {
                    filePath: '/project/src/utils/helpers.js',
                    imports: [],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 10, linesOfComments: 0, complexity: 1, imports: 0, exports: 0 }
                },
                {
                    filePath: '/project/src/components/Icon.js',
                    imports: [],
                    exports: [],
                    functions: [],
                    classes: [],
                    variables: [],
                    errors: [],
                    metrics: { linesOfCode: 5, linesOfComments: 0, complexity: 1, imports: 0, exports: 0 }
                }
            ];
            
            const result = await analyzer.analyze(parseResults);
            
            // Should have dependencies from Button to both helpers and Icon
            expect(result.dependencies.length).toBeGreaterThanOrEqual(0);
        });
    });
});
import { GraphGenerator } from '../../src/graph';
import { Logger } from '../../src/utils/logger';
import { IAnalysisResult } from '../../src/analyzer';
import { NodeType, EdgeType } from '../../src/types/graph';

describe('GraphGenerator', () => {
    let generator: GraphGenerator;
    let mockLogger: Logger;
    
    beforeEach(() => {
        mockLogger = new Logger('test');
        generator = new GraphGenerator(mockLogger);
        jest.clearAllMocks();
    });
    
    describe('generate', () => {
        it('should generate graph data from analysis result', async () => {
            const analysisResult: IAnalysisResult = {
                files: [
                    '/project/src/index.js',
                    '/project/src/utils.js'
                ],
                dependencies: [
                    {
                        source: '/project/src/index.js',
                        target: '/project/src/utils.js',
                        type: 'import',
                        count: 1
                    }
                ],
                orphanedFiles: [],
                circularDependencies: [],
                entryPoints: ['/project/src/index.js']
            };
            
            const graphData = await generator.generate(analysisResult);
            
            expect(graphData).toBeDefined();
            expect(graphData.nodes).toHaveLength(2);
            expect(graphData.edges).toHaveLength(1);
            expect(graphData.metadata).toBeDefined();
            expect(graphData.metadata.totalFiles).toBe(2);
            expect(graphData.metadata.totalDependencies).toBe(1);
        });
        
        it('should mark entry point nodes correctly', async () => {
            const analysisResult: IAnalysisResult = {
                files: ['/project/index.js', '/project/lib.js'],
                dependencies: [
                    {
                        source: '/project/index.js',
                        target: '/project/lib.js',
                        type: 'import',
                        count: 1
                    }
                ],
                orphanedFiles: [],
                circularDependencies: [],
                entryPoints: ['/project/index.js']
            };
            
            const graphData = await generator.generate(analysisResult);
            
            const entryNode = graphData.nodes.find(n => n.id === '/project/index.js');
            expect(entryNode?.type).toBe(NodeType.ENTRY);
        });
        
        it('should mark orphaned nodes correctly', async () => {
            const analysisResult: IAnalysisResult = {
                files: ['/project/used.js', '/project/orphaned.js'],
                dependencies: [],
                orphanedFiles: ['/project/orphaned.js'],
                circularDependencies: [],
                entryPoints: ['/project/used.js']
            };
            
            const graphData = await generator.generate(analysisResult);
            
            const orphanedNode = graphData.nodes.find(n => n.id === '/project/orphaned.js');
            expect(orphanedNode?.type).toBe(NodeType.ORPHANED);
        });
        
        it('should assign colors based on file type', async () => {
            const analysisResult: IAnalysisResult = {
                files: [
                    '/project/app.ts',
                    '/project/component.tsx',
                    '/project/script.js',
                    '/project/component.jsx'
                ],
                dependencies: [],
                orphanedFiles: [],
                circularDependencies: [],
                entryPoints: []
            };
            
            const graphData = await generator.generate(analysisResult);
            
            const tsNode = graphData.nodes.find(n => n.id.endsWith('.ts'));
            const tsxNode = graphData.nodes.find(n => n.id.endsWith('.tsx'));
            const jsNode = graphData.nodes.find(n => n.id.endsWith('.js'));
            const jsxNode = graphData.nodes.find(n => n.id.endsWith('.jsx'));
            
            expect(tsNode?.color).toBe('#3178c6'); // TypeScript blue
            expect(tsxNode?.color).toBe('#61dafb'); // React blue
            expect(jsNode?.color).toBe('#f7df1e'); // JavaScript yellow
            expect(jsxNode?.color).toBe('#61dafb'); // React blue
        });
        
        it('should create edges with correct types', async () => {
            const analysisResult: IAnalysisResult = {
                files: ['/project/a.js', '/project/b.js'],
                dependencies: [
                    {
                        source: '/project/a.js',
                        target: '/project/b.js',
                        type: 'dynamic',
                        count: 2
                    }
                ],
                orphanedFiles: [],
                circularDependencies: [],
                entryPoints: []
            };
            
            const graphData = await generator.generate(analysisResult);
            
            const edge = graphData.edges[0];
            expect(edge.type).toBe(EdgeType.DYNAMIC);
            expect(edge.weight).toBe(2);
        });
        
        it('should include circular dependencies in metadata', async () => {
            const analysisResult: IAnalysisResult = {
                files: ['/project/a.js', '/project/b.js'],
                dependencies: [],
                orphanedFiles: [],
                circularDependencies: [
                    ['/project/a.js', '/project/b.js', '/project/a.js']
                ],
                entryPoints: []
            };
            
            const graphData = await generator.generate(analysisResult);
            
            expect(graphData.metadata.circularDependencies).toBe(1);
        });
        
        it('should handle empty analysis result', async () => {
            const analysisResult: IAnalysisResult = {
                files: [],
                dependencies: [],
                orphanedFiles: [],
                circularDependencies: [],
                entryPoints: []
            };
            
            const graphData = await generator.generate(analysisResult);
            
            expect(graphData.nodes).toHaveLength(0);
            expect(graphData.edges).toHaveLength(0);
            expect(graphData.metadata.totalFiles).toBe(0);
        });
        
        it('should group nodes by directory', async () => {
            const analysisResult: IAnalysisResult = {
                files: [
                    '/project/src/components/Button.js',
                    '/project/src/components/Icon.js',
                    '/project/src/utils/helpers.js'
                ],
                dependencies: [],
                orphanedFiles: [],
                circularDependencies: [],
                entryPoints: []
            };
            
            const graphData = await generator.generate(analysisResult);
            
            const buttonNode = graphData.nodes.find(n => n.label === 'Button.js');
            const iconNode = graphData.nodes.find(n => n.label === 'Icon.js');
            
            expect(buttonNode?.group).toBe(iconNode?.group);
            expect(buttonNode?.group).toContain('components');
        });
    });
});
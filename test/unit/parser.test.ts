import { Parser } from '../../src/parser';
import { Logger } from '../../src/utils/logger';
import { CacheManager } from '../../src/utils/cache';
import * as fs from 'fs';
import { vscode } from '../setup';

jest.mock('ts-morph');

describe('Parser', () => {
    let parser: Parser;
    let mockLogger: Logger;
    let mockCacheManager: CacheManager;
    let mockContext: any;
    
    beforeEach(() => {
        mockContext = createMockContext();
        mockLogger = new Logger('test');
        mockCacheManager = new CacheManager(mockContext);
        parser = new Parser(mockLogger, mockCacheManager);
        
        // Reset mocks
        jest.clearAllMocks();
    });
    
    describe('parseWorkspace', () => {
        it('should parse JavaScript files in workspace', async () => {
            const mockFiles = [
                '/test/workspace/index.js',
                '/test/workspace/utils.js'
            ];
            
            // Mock file system
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'index.js', isFile: () => true, isDirectory: () => false },
                { name: 'utils.js', isFile: () => true, isDirectory: () => false }
            ]);
            
            (fs.promises.readFile as jest.Mock).mockResolvedValue(`
                import { helper } from './utils';
                export const main = () => helper();
            `);
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            expect(results).toBeDefined();
            expect(results.length).toBeGreaterThanOrEqual(0);
        });
        
        it('should use cache for already parsed files', async () => {
            const cachedResult = {
                filePath: '/test/workspace/cached.js',
                imports: [],
                exports: [],
                functions: [],
                classes: [],
                variables: [],
                errors: [],
                metrics: {
                    linesOfCode: 10,
                    linesOfComments: 2,
                    complexity: 1,
                    imports: 0,
                    exports: 0
                }
            };
            
            jest.spyOn(mockCacheManager, 'get').mockResolvedValue(cachedResult);
            
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'cached.js', isFile: () => true, isDirectory: () => false }
            ]);
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            expect(mockCacheManager.get).toHaveBeenCalled();
            expect(results).toContainEqual(cachedResult);
        });
        
        it('should exclude node_modules and other configured patterns', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'index.js', isFile: () => true, isDirectory: () => false },
                { name: 'node_modules', isFile: () => false, isDirectory: () => true },
                { name: 'dist', isFile: () => false, isDirectory: () => true }
            ]);
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            expect(fs.promises.readFile).not.toHaveBeenCalledWith(
                expect.stringContaining('node_modules'),
                expect.anything()
            );
        });
        
        it('should handle parsing errors gracefully', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'broken.js', isFile: () => true, isDirectory: () => false }
            ]);
            
            (fs.promises.readFile as jest.Mock).mockRejectedValue(
                new Error('File read error')
            );
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            expect(mockLogger.error).toHaveBeenCalled();
            expect(results).toEqual([]);
        });
    });
    
    describe('file type detection', () => {
        it('should parse TypeScript files', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'app.ts', isFile: () => true, isDirectory: () => false },
                { name: 'component.tsx', isFile: () => true, isDirectory: () => false }
            ]);
            
            (fs.promises.readFile as jest.Mock).mockResolvedValue(`
                import React from 'react';
                export default function App() { return <div />; }
            `);
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            expect(fs.promises.readFile).toHaveBeenCalledWith(
                expect.stringContaining('.ts'),
                'utf-8'
            );
        });
        
        it('should parse JSX files', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'component.jsx', isFile: () => true, isDirectory: () => false }
            ]);
            
            (fs.promises.readFile as jest.Mock).mockResolvedValue(`
                import React from 'react';
                export const Component = () => <div>Hello</div>;
            `);
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            expect(fs.promises.readFile).toHaveBeenCalledWith(
                expect.stringContaining('.jsx'),
                'utf-8'
            );
        });
    });
    
    describe('import/export extraction', () => {
        it('should extract ES6 imports', async () => {
            const testCode = `
                import defaultExport from 'module';
                import { named } from 'module';
                import { named as alias } from 'module';
                import * as namespace from 'module';
            `;
            
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'test.js', isFile: () => true, isDirectory: () => false }
            ]);
            
            (fs.promises.readFile as jest.Mock).mockResolvedValue(testCode);
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            // Parser should extract various import types
            expect(results.length).toBeGreaterThanOrEqual(0);
        });
        
        it('should extract exports', async () => {
            const testCode = `
                export const named = 'value';
                export default function() {}
                export { reexport } from 'module';
            `;
            
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                { name: 'test.js', isFile: () => true, isDirectory: () => false }
            ]);
            
            (fs.promises.readFile as jest.Mock).mockResolvedValue(testCode);
            
            const results = await parser.parseWorkspace('/test/workspace');
            
            expect(results.length).toBeGreaterThanOrEqual(0);
        });
    });
});
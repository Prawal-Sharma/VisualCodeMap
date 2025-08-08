import * as path from 'path';
import { Logger } from '../utils/logger';
import { IParseResult } from '../types/parser';

export interface IDependency {
    source: string;
    target: string;
    type: string;
    count: number;
}

export interface IAnalysisResult {
    dependencies: IDependency[];
    files: string[];
    orphanedFiles: string[];
    circularDependencies: string[][];
    entryPoints: string[];
}

export class Analyzer {
    constructor(private logger: Logger) {}
    
    async analyze(parseResults: IParseResult[]): Promise<IAnalysisResult> {
        this.logger.info('Starting dependency analysis');
        
        const dependencies: IDependency[] = [];
        const files = parseResults.map(r => r.filePath);
        const dependencyMap = new Map<string, Set<string>>();
        
        for (const result of parseResults) {
            const sourcePath = result.filePath;
            const sourceDir = path.dirname(sourcePath);
            const deps = new Set<string>();
            
            for (const imp of result.imports) {
                const resolvedPath = this.resolveImportPath(imp.source, sourceDir, files);
                
                if (resolvedPath && resolvedPath !== sourcePath) {
                    deps.add(resolvedPath);
                    
                    const existing = dependencies.find(
                        d => d.source === sourcePath && d.target === resolvedPath
                    );
                    
                    if (existing) {
                        existing.count++;
                    } else {
                        dependencies.push({
                            source: sourcePath,
                            target: resolvedPath,
                            type: imp.type,
                            count: 1
                        });
                    }
                }
            }
            
            dependencyMap.set(sourcePath, deps);
        }
        
        const orphanedFiles = this.findOrphanedFiles(files, dependencyMap);
        const circularDependencies = this.detectCircularDependencies(dependencyMap);
        const entryPoints = this.findEntryPoints(files, dependencyMap);
        
        this.logger.info(`Analysis complete: ${dependencies.length} dependencies found`);
        
        return {
            dependencies,
            files,
            orphanedFiles,
            circularDependencies,
            entryPoints
        };
    }
    
    private resolveImportPath(importPath: string, sourceDir: string, allFiles: string[]): string | null {
        if (importPath.startsWith('.')) {
            const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
            
            for (const ext of extensions) {
                const resolved = path.resolve(sourceDir, importPath + ext);
                if (allFiles.includes(resolved)) {
                    return resolved;
                }
            }
        }
        
        return null;
    }
    
    private findOrphanedFiles(files: string[], dependencyMap: Map<string, Set<string>>): string[] {
        const orphaned: string[] = [];
        const referenced = new Set<string>();
        
        for (const [source, targets] of dependencyMap.entries()) {
            referenced.add(source);
            targets.forEach(target => referenced.add(target));
        }
        
        for (const file of files) {
            if (!referenced.has(file)) {
                orphaned.push(file);
            }
        }
        
        return orphaned;
    }
    
    private detectCircularDependencies(dependencyMap: Map<string, Set<string>>): string[][] {
        const circular: string[][] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        
        const dfs = (node: string, path: string[]): void => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            
            const dependencies = dependencyMap.get(node) || new Set();
            
            for (const dep of dependencies) {
                if (!visited.has(dep)) {
                    dfs(dep, [...path]);
                } else if (recursionStack.has(dep)) {
                    const cycleStart = path.indexOf(dep);
                    if (cycleStart !== -1) {
                        const cycle = path.slice(cycleStart);
                        cycle.push(dep);
                        circular.push(cycle);
                    }
                }
            }
            
            recursionStack.delete(node);
        };
        
        for (const file of dependencyMap.keys()) {
            if (!visited.has(file)) {
                dfs(file, []);
            }
        }
        
        return circular;
    }
    
    private findEntryPoints(files: string[], dependencyMap: Map<string, Set<string>>): string[] {
        const imported = new Set<string>();
        
        for (const deps of dependencyMap.values()) {
            deps.forEach(dep => imported.add(dep));
        }
        
        return files.filter(file => !imported.has(file));
    }
}
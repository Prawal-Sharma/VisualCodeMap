import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Project, SourceFile } from 'ts-morph';
import { Logger } from '../utils/logger';
import { CacheManager } from '../utils/cache';
import { IParseResult, IImport, IExport, ImportType, ExportType } from '../types/parser';

export class Parser {
    private project: Project;
    private excludePatterns: string[];
    
    constructor(
        private logger: Logger,
        private cacheManager: CacheManager
    ) {
        this.project = new Project({
            compilerOptions: {
                allowJs: true,
                jsx: 4, // React JSX
            }
        });
        
        const config = vscode.workspace.getConfiguration('visualCodeMap');
        this.excludePatterns = config.get('excludePatterns', ['node_modules', 'dist', 'build']);
    }
    
    async parseWorkspace(
        workspacePath: string,
        token?: vscode.CancellationToken
    ): Promise<IParseResult[]> {
        this.logger.info(`Starting workspace parse: ${workspacePath}`);
        
        const files = await this.findSourceFiles(workspacePath);
        const results: IParseResult[] = [];
        
        for (const file of files) {
            if (token?.isCancellationRequested) {
                break;
            }
            
            const cached = await this.cacheManager.get(file);
            if (cached) {
                results.push(cached);
                continue;
            }
            
            try {
                const result = await this.parseFile(file);
                results.push(result);
                await this.cacheManager.set(file, result);
            } catch (error) {
                this.logger.error(`Failed to parse ${file}`, error);
            }
        }
        
        this.logger.info(`Parsed ${results.length} files`);
        return results;
    }
    
    private async findSourceFiles(workspacePath: string): Promise<string[]> {
        const files: string[] = [];
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
        
        const walk = async (dir: string) => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(workspacePath, fullPath);
                
                if (this.shouldExclude(relativePath)) {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    await walk(fullPath);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        };
        
        await walk(workspacePath);
        return files;
    }
    
    private shouldExclude(relativePath: string): boolean {
        return this.excludePatterns.some(pattern => 
            relativePath.includes(pattern)
        );
    }
    
    private async parseFile(filePath: string): Promise<IParseResult> {
        const sourceFile = this.project.addSourceFileAtPath(filePath);
        
        const imports = this.extractImports(sourceFile);
        const exports = this.extractExports(sourceFile);
        
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
        
        return {
            filePath,
            imports,
            exports,
            functions: [],
            classes: [],
            variables: [],
            errors: [],
            metrics: {
                linesOfCode,
                linesOfComments: lines.length - linesOfCode,
                complexity: 1,
                imports: imports.length,
                exports: exports.length
            }
        };
    }
    
    private extractImports(sourceFile: SourceFile): IImport[] {
        const imports: IImport[] = [];
        
        sourceFile.getImportDeclarations().forEach(importDecl => {
            const source = importDecl.getModuleSpecifierValue();
            const line = importDecl.getStartLineNumber();
            const column = importDecl.getStartLinePos();
            
            const specifiers = importDecl.getNamedImports().map(named => ({
                name: named.getName(),
                alias: named.getAliasNode()?.getText(),
                isDefault: false,
                isNamespace: false
            }));
            
            const defaultImport = importDecl.getDefaultImport();
            if (defaultImport) {
                specifiers.push({
                    name: defaultImport.getText(),
                    alias: undefined,
                    isDefault: true,
                    isNamespace: false
                });
            }
            
            const namespaceImport = importDecl.getNamespaceImport();
            if (namespaceImport) {
                specifiers.push({
                    name: namespaceImport.getText(),
                    alias: undefined,
                    isDefault: false,
                    isNamespace: true
                });
            }
            
            imports.push({
                source,
                specifiers,
                type: ImportType.ES6,
                line,
                column
            });
        });
        
        return imports;
    }
    
    private extractExports(sourceFile: SourceFile): IExport[] {
        const exports: IExport[] = [];
        
        sourceFile.getExportDeclarations().forEach(exportDecl => {
            const line = exportDecl.getStartLineNumber();
            const column = exportDecl.getStartLinePos();
            
            exportDecl.getNamedExports().forEach(named => {
                exports.push({
                    name: named.getName(),
                    type: ExportType.NAMED,
                    source: exportDecl.getModuleSpecifierValue(),
                    line,
                    column
                });
            });
        });
        
        sourceFile.getExportAssignments().forEach(exportAssign => {
            exports.push({
                name: 'default',
                type: ExportType.DEFAULT,
                line: exportAssign.getStartLineNumber(),
                column: exportAssign.getStartLinePos()
            });
        });
        
        return exports;
    }
}
import * as path from 'path';
import { Logger } from '../utils/logger';
import { IAnalysisResult } from '../analyzer';
import { IGraphData, IGraphNode, IGraphEdge, NodeType, EdgeType, IGraphMetadata } from '../types/graph';

export class GraphGenerator {
    constructor(private logger: Logger) {}
    
    async generate(analysis: IAnalysisResult): Promise<IGraphData> {
        this.logger.info('Generating graph data');
        
        const nodes = this.createNodes(analysis);
        const edges = this.createEdges(analysis);
        const metadata = this.createMetadata(analysis);
        
        this.logger.info(`Generated graph with ${nodes.length} nodes and ${edges.length} edges`);
        
        return {
            nodes,
            edges,
            metadata
        };
    }
    
    private createNodes(analysis: IAnalysisResult): IGraphNode[] {
        const nodes: IGraphNode[] = [];
        const workspaceRoot = this.findCommonRoot(analysis.files);
        
        for (const file of analysis.files) {
            const relativePath = path.relative(workspaceRoot, file);
            const fileName = path.basename(file);
            const isOrphaned = analysis.orphanedFiles.includes(file);
            const isEntry = analysis.entryPoints.includes(file);
            
            let type = NodeType.FILE;
            if (isOrphaned) {
                type = NodeType.ORPHANED;
            } else if (isEntry) {
                type = NodeType.ENTRY;
            }
            
            nodes.push({
                id: file,
                label: fileName,
                path: relativePath,
                type,
                group: path.dirname(relativePath),
                color: this.getNodeColor(type, path.extname(file))
            });
        }
        
        return nodes;
    }
    
    private createEdges(analysis: IAnalysisResult): IGraphEdge[] {
        const edges: IGraphEdge[] = [];
        
        for (const dep of analysis.dependencies) {
            let edgeType = EdgeType.IMPORT;
            
            if (dep.type === 'dynamic') {
                edgeType = EdgeType.DYNAMIC;
            } else if (dep.type === 'commonjs') {
                edgeType = EdgeType.REQUIRE;
            } else if (dep.type === 'type-only') {
                edgeType = EdgeType.TYPE_ONLY;
            }
            
            edges.push({
                id: `${dep.source}-${dep.target}`,
                source: dep.source,
                target: dep.target,
                type: edgeType,
                weight: dep.count
            });
        }
        
        return edges;
    }
    
    private createMetadata(analysis: IAnalysisResult): IGraphMetadata {
        return {
            totalFiles: analysis.files.length,
            totalDependencies: analysis.dependencies.length,
            circularDependencies: analysis.circularDependencies.length,
            orphanedFiles: analysis.orphanedFiles.length,
            timestamp: new Date().toISOString(),
            workspacePath: this.findCommonRoot(analysis.files)
        };
    }
    
    private findCommonRoot(files: string[]): string {
        if (files.length === 0) return '';
        if (files.length === 1) return path.dirname(files[0]);
        
        const parts = files[0].split(path.sep);
        let commonPath = '';
        
        for (let i = 0; i < parts.length; i++) {
            const testPath = parts.slice(0, i + 1).join(path.sep);
            if (files.every(f => f.startsWith(testPath))) {
                commonPath = testPath;
            } else {
                break;
            }
        }
        
        return commonPath;
    }
    
    private getNodeColor(type: NodeType, extension: string): string {
        if (type === NodeType.ORPHANED) return '#ff6b6b';
        if (type === NodeType.ENTRY) return '#51cf66';
        
        const colors: { [key: string]: string } = {
            '.ts': '#3178c6',
            '.tsx': '#61dafb',
            '.js': '#f7df1e',
            '.jsx': '#61dafb'
        };
        
        return colors[extension] || '#868e96';
    }
}
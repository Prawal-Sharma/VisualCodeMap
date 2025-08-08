export interface IGraphNode {
    id: string;
    label: string;
    path: string;
    type: NodeType;
    size?: number;
    metrics?: INodeMetrics;
    position?: IPosition;
    color?: string;
    group?: string;
}

export interface IGraphEdge {
    id: string;
    source: string;
    target: string;
    type: EdgeType;
    weight?: number;
    label?: string;
}

export interface IGraphData {
    nodes: IGraphNode[];
    edges: IGraphEdge[];
    metadata: IGraphMetadata;
}

export interface IGraphMetadata {
    totalFiles: number;
    totalDependencies: number;
    circularDependencies: number;
    orphanedFiles: number;
    timestamp: string;
    workspacePath: string;
}

export interface INodeMetrics {
    imports: number;
    exports: number;
    linesOfCode: number;
    complexity?: number;
    maintainabilityIndex?: number;
}

export interface IPosition {
    x: number;
    y: number;
}

export enum NodeType {
    FILE = 'file',
    DIRECTORY = 'directory',
    EXTERNAL = 'external',
    ENTRY = 'entry',
    ORPHANED = 'orphaned'
}

export enum EdgeType {
    IMPORT = 'import',
    EXPORT = 'export',
    DYNAMIC = 'dynamic',
    REQUIRE = 'require',
    TYPE_ONLY = 'type-only'
}

export interface ILayoutOptions {
    type: LayoutType;
    nodeSpacing?: number;
    levelSpacing?: number;
    edgeLength?: number;
    iterations?: number;
}

export enum LayoutType {
    FORCE_DIRECTED = 'force-directed',
    HIERARCHICAL = 'hierarchical',
    CIRCULAR = 'circular',
    GRID = 'grid'
}

export interface IFilterOptions {
    includeExternal?: boolean;
    includeOrphaned?: boolean;
    includeTests?: boolean;
    fileTypes?: string[];
    directories?: string[];
    maxDepth?: number;
    searchTerm?: string;
}

export interface IExportOptions {
    format: ExportFormat;
    includeMetadata?: boolean;
    scale?: number;
    quality?: number;
}

export enum ExportFormat {
    PNG = 'png',
    SVG = 'svg',
    JSON = 'json',
    HTML = 'html',
    PDF = 'pdf'
}
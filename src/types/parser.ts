export interface IParseResult {
    filePath: string;
    imports: IImport[];
    exports: IExport[];
    functions: IFunction[];
    classes: IClass[];
    variables: IVariable[];
    errors: IParseError[];
    metrics: IFileMetrics;
}

export interface IImport {
    source: string;
    specifiers: IImportSpecifier[];
    type: ImportType;
    line: number;
    column: number;
}

export interface IImportSpecifier {
    name: string;
    alias?: string;
    isDefault?: boolean;
    isNamespace?: boolean;
}

export interface IExport {
    name: string;
    type: ExportType;
    source?: string;
    line: number;
    column: number;
}

export interface IFunction {
    name: string;
    parameters: string[];
    returnType?: string;
    isAsync: boolean;
    isGenerator: boolean;
    line: number;
}

export interface IClass {
    name: string;
    extends?: string;
    implements?: string[];
    methods: IFunction[];
    properties: IVariable[];
    line: number;
}

export interface IVariable {
    name: string;
    type?: string;
    isConst: boolean;
    isExported: boolean;
    line: number;
}

export interface IParseError {
    message: string;
    line?: number;
    column?: number;
    severity: ErrorSeverity;
}

export interface IFileMetrics {
    linesOfCode: number;
    linesOfComments: number;
    complexity: number;
    imports: number;
    exports: number;
}

export enum ImportType {
    ES6 = 'es6',
    COMMONJS = 'commonjs',
    DYNAMIC = 'dynamic',
    TYPE_ONLY = 'type-only'
}

export enum ExportType {
    NAMED = 'named',
    DEFAULT = 'default',
    NAMESPACE = 'namespace',
    RE_EXPORT = 're-export'
}

export enum ErrorSeverity {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

export interface IParserOptions {
    includeTypeOnly?: boolean;
    includeDynamic?: boolean;
    includeComments?: boolean;
    calculateComplexity?: boolean;
    maxFileSize?: number;
    timeout?: number;
}
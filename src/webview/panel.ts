import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { IGraphData } from '../types/graph';

export class WebviewPanel {
    private panel: vscode.WebviewPanel | undefined;
    private disposables: vscode.Disposable[] = [];
    
    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger
    ) {}
    
    async create(graphData: IGraphData): Promise<void> {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        
        this.panel = vscode.window.createWebviewPanel(
            'visualCodeMap',
            'Visual Code Map',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview'),
                    vscode.Uri.joinPath(this.context.extensionUri, 'resources')
                ]
            }
        );
        
        this.panel.webview.html = this.getWebviewContent(graphData);
        
        this.panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'openFile':
                        await this.openFile(message.filePath);
                        break;
                    case 'refresh':
                        await vscode.commands.executeCommand('visualCodeMap.refresh');
                        break;
                    case 'export':
                        await vscode.commands.executeCommand('visualCodeMap.export');
                        break;
                    case 'log':
                        this.logger.info(`[Webview] ${message.text}`);
                        break;
                }
            },
            null,
            this.disposables
        );
        
        this.panel.onDidDispose(
            () => this.dispose(),
            null,
            this.disposables
        );
    }
    
    update(graphData: IGraphData): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'update',
                data: graphData
            });
        }
    }
    
    reveal(): void {
        if (this.panel) {
            this.panel.reveal();
        }
    }
    
    private async openFile(filePath: string): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
            this.logger.info(`Opened file: ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to open file: ${filePath}`, error);
            vscode.window.showErrorMessage(`Failed to open file: ${filePath}`);
        }
    }
    
    private getWebviewContent(graphData: IGraphData): string {
        const scriptUri = this.getUri('webview', 'webview.js');
        const styleUri = this.getUri('webview', 'styles.css');
        const d3Uri = this.getUri('../../node_modules/d3/dist', 'd3.min.js');
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${this.panel?.webview.cspSource} 'unsafe-inline'; style-src ${this.panel?.webview.cspSource} 'unsafe-inline';">
    <link href="${styleUri}" rel="stylesheet">
    <title>Visual Code Map</title>
</head>
<body>
    <div id="toolbar">
        <button id="zoom-in" title="Zoom In">+</button>
        <button id="zoom-out" title="Zoom Out">-</button>
        <button id="zoom-reset" title="Reset Zoom">⟲</button>
        <button id="refresh" title="Refresh">↻</button>
        <button id="export" title="Export">⬇</button>
        <input type="text" id="search" placeholder="Search nodes...">
        <select id="layout">
            <option value="force-directed">Force Directed</option>
            <option value="hierarchical">Hierarchical</option>
            <option value="circular">Circular</option>
        </select>
        <label>
            <input type="checkbox" id="show-orphaned"> Show Orphaned
        </label>
    </div>
    <div id="graph-container">
        <svg id="graph"></svg>
    </div>
    <div id="info-panel">
        <h3>Graph Statistics</h3>
        <div id="stats">
            <div>Files: <span id="total-files">${graphData.metadata.totalFiles}</span></div>
            <div>Dependencies: <span id="total-deps">${graphData.metadata.totalDependencies}</span></div>
            <div>Circular: <span id="circular-deps">${graphData.metadata.circularDependencies}</span></div>
            <div>Orphaned: <span id="orphaned-files">${graphData.metadata.orphanedFiles}</span></div>
        </div>
        <h3>Selected Node</h3>
        <div id="node-info">No node selected</div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const initialData = ${JSON.stringify(graphData)};
    </script>
    <script src="${d3Uri}"></script>
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
    
    private getUri(...pathSegments: string[]): vscode.Uri {
        return this.panel!.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', ...pathSegments)
        );
    }
    
    dispose(): void {
        this.panel = undefined;
        
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    
    onDispose(callback: () => void): void {
        if (this.panel) {
            this.panel.onDidDispose(callback);
        }
    }
}
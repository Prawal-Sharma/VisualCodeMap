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
        const scriptUri = this.panel?.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'webview.js')
        );
        const d3Uri = this.panel?.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'd3', 'dist', 'd3.min.js')
        );
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${this.panel?.webview.cspSource} 'unsafe-inline'; style-src ${this.panel?.webview.cspSource} 'unsafe-inline';">
    <style>
        ${this.getStyles()}
    </style>
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
    
    private getStyles(): string {
        return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--vscode-editor-background, #1e1e1e);
    color: var(--vscode-editor-foreground, #cccccc);
    overflow: hidden;
}

#toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--vscode-titleBar-activeBackground, #2c2c2c);
    border-bottom: 1px solid var(--vscode-widget-border, #454545);
    height: 60px;
}

#toolbar button {
    padding: 6px 12px;
    background: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #ffffff);
    border: none;
    border-radius: 2px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

#toolbar button:hover {
    background: var(--vscode-button-hoverBackground, #1177bb);
}

#toolbar input[type="text"] {
    padding: 6px 10px;
    background: var(--vscode-input-background, #3c3c3c);
    color: var(--vscode-input-foreground, #cccccc);
    border: 1px solid var(--vscode-input-border, #454545);
    border-radius: 2px;
    width: 200px;
}

#toolbar select {
    padding: 6px 10px;
    background: var(--vscode-dropdown-background, #3c3c3c);
    color: var(--vscode-dropdown-foreground, #cccccc);
    border: 1px solid var(--vscode-dropdown-border, #454545);
    border-radius: 2px;
    cursor: pointer;
}

#toolbar label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
}

#graph-container {
    position: relative;
    width: calc(100vw - 300px);
    height: calc(100vh - 60px);
    float: left;
}

#graph {
    width: 100%;
    height: 100%;
    background: var(--vscode-editor-background, #1e1e1e);
}

.node {
    cursor: pointer;
    transition: all 0.2s;
}

.node:hover {
    stroke-width: 3px;
    filter: brightness(1.2);
}

.node-label {
    fill: var(--vscode-editor-foreground, #cccccc);
    font-size: 12px;
    user-select: none;
    pointer-events: none;
}

.link {
    stroke: #999;
    stroke-opacity: 0.6;
    pointer-events: none;
}

#info-panel {
    position: fixed;
    right: 0;
    top: 60px;
    width: 300px;
    height: calc(100vh - 60px);
    background: var(--vscode-sideBar-background, #252526);
    border-left: 1px solid var(--vscode-widget-border, #454545);
    padding: 20px;
    overflow-y: auto;
}

#info-panel h3 {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--vscode-foreground, #cccccc);
}

#stats {
    margin-bottom: 30px;
}

#stats div {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 14px;
    border-bottom: 1px solid var(--vscode-widget-border, #454545);
}

#stats span {
    font-weight: 600;
    color: var(--vscode-textLink-activeForeground, #3794ff);
}

#node-info {
    font-size: 14px;
    line-height: 1.6;
    color: var(--vscode-editor-foreground, #cccccc);
}

.tooltip {
    position: absolute;
    padding: 8px 12px;
    background: var(--vscode-editorWidget-background, #252526);
    border: 1px solid var(--vscode-widget-border, #454545);
    border-radius: 3px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
        `;
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
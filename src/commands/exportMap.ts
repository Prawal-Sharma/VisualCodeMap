import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

export class ExportMapCommand {
    constructor(private logger: Logger) {}
    
    async execute(context: vscode.ExtensionContext): Promise<void> {
        try {
            const isActive = context.globalState.get('visualCodeMap.active');
            
            if (!isActive) {
                vscode.window.showInformationMessage('No active code map to export');
                return;
            }
            
            const exportFormat = await vscode.window.showQuickPick(
                ['PNG', 'SVG', 'JSON', 'HTML'],
                {
                    placeHolder: 'Select export format'
                }
            );
            
            if (!exportFormat) {
                return;
            }
            
            const defaultFileName = `code-map-${Date.now()}.${exportFormat.toLowerCase()}`;
            const saveUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(path.join(vscode.workspace.rootPath || '', defaultFileName)),
                filters: this.getFilters(exportFormat)
            });
            
            if (!saveUri) {
                return;
            }
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Exporting Code Map as ${exportFormat}`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 50, message: 'Exporting...' });
                
                await this.performExport(exportFormat, saveUri.fsPath);
                
                progress.report({ increment: 100, message: 'Complete!' });
            });
            
            vscode.window.showInformationMessage(`Code map exported to ${saveUri.fsPath}`);
            this.logger.info(`Code map exported as ${exportFormat} to ${saveUri.fsPath}`);
            
        } catch (error) {
            this.logger.error('Failed to export code map', error);
            vscode.window.showErrorMessage(`Failed to export code map: ${error}`);
        }
    }
    
    private getFilters(format: string): { [name: string]: string[] } {
        switch (format) {
            case 'PNG':
                return { 'PNG Image': ['png'] };
            case 'SVG':
                return { 'SVG Image': ['svg'] };
            case 'JSON':
                return { 'JSON Data': ['json'] };
            case 'HTML':
                return { 'HTML Document': ['html'] };
            default:
                return {};
        }
    }
    
    private async performExport(format: string, filePath: string): Promise<void> {
        const graphData = await this.getGraphData();
        
        switch (format) {
            case 'JSON':
                await this.exportJSON(graphData, filePath);
                break;
            case 'HTML':
                await this.exportHTML(graphData, filePath);
                break;
            case 'PNG':
            case 'SVG':
                await this.exportImage(format, filePath);
                break;
        }
    }
    
    private async getGraphData(): Promise<any> {
        return {
            nodes: [],
            edges: [],
            metadata: {
                timestamp: new Date().toISOString(),
                version: '0.1.0'
            }
        };
    }
    
    private async exportJSON(data: any, filePath: string): Promise<void> {
        const jsonContent = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(filePath, jsonContent, 'utf-8');
    }
    
    private async exportHTML(data: any, filePath: string): Promise<void> {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Code Map</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        #graph { width: 100%; height: 800px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>Code Map</h1>
    <div id="graph"></div>
    <script>
        const graphData = ${JSON.stringify(data)};
        console.log('Graph data:', graphData);
    </script>
</body>
</html>`;
        await fs.promises.writeFile(filePath, htmlContent, 'utf-8');
    }
    
    private async exportImage(format: string, filePath: string): Promise<void> {
        vscode.window.showInformationMessage(`${format} export will be implemented with webview integration`);
    }
}
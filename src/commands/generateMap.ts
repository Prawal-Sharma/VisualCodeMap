import * as vscode from 'vscode';
import { Parser } from '../parser';
import { Analyzer } from '../analyzer';
import { GraphGenerator } from '../graph';
import { WebviewPanel } from '../webview/panel';
import { Logger } from '../utils/logger';
import { CacheManager } from '../utils/cache';
import { IGraphData } from '../types/graph';

export class GenerateMapCommand {
    private webviewPanel: WebviewPanel | undefined;
    
    constructor(
        private logger: Logger,
        private cacheManager: CacheManager
    ) {}
    
    async execute(context: vscode.ExtensionContext): Promise<void> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Code Map',
                cancellable: true
            }, async (progress, token) => {
                progress.report({ increment: 0, message: 'Initializing...' });
                
                if (token.isCancellationRequested) {
                    return;
                }
                
                progress.report({ increment: 20, message: 'Parsing files...' });
                const parser = new Parser(this.logger, this.cacheManager);
                const parseResults = await parser.parseWorkspace(workspaceFolder.uri.fsPath, token);
                
                if (token.isCancellationRequested) {
                    return;
                }
                
                progress.report({ increment: 40, message: 'Analyzing dependencies...' });
                const analyzer = new Analyzer(this.logger);
                const dependencies = await analyzer.analyze(parseResults);
                
                if (token.isCancellationRequested) {
                    return;
                }
                
                progress.report({ increment: 60, message: 'Generating graph...' });
                const graphGenerator = new GraphGenerator(this.logger);
                const graphData = await graphGenerator.generate(dependencies);
                
                if (token.isCancellationRequested) {
                    return;
                }
                
                progress.report({ increment: 80, message: 'Creating visualization...' });
                await this.showWebview(context, graphData);
                
                progress.report({ increment: 100, message: 'Complete!' });
            });
            
            await context.globalState.update('visualCodeMap.active', true);
            await vscode.commands.executeCommand('setContext', 'visualCodeMap.active', true);
            
            this.logger.info('Code map generated successfully');
            
        } catch (error) {
            this.logger.error('Failed to generate code map', error);
            vscode.window.showErrorMessage(`Failed to generate code map: ${error}`);
        }
    }
    
    private async showWebview(context: vscode.ExtensionContext, graphData: IGraphData): Promise<void> {
        if (this.webviewPanel) {
            this.webviewPanel.reveal();
            this.webviewPanel.update(graphData);
        } else {
            this.webviewPanel = new WebviewPanel(context, this.logger);
            await this.webviewPanel.create(graphData);
            
            this.webviewPanel.onDispose(() => {
                this.webviewPanel = undefined;
                context.globalState.update('visualCodeMap.active', false);
                vscode.commands.executeCommand('setContext', 'visualCodeMap.active', false);
            });
        }
    }
}
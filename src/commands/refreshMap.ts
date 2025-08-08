import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { CacheManager } from '../utils/cache';

export class RefreshMapCommand {
    constructor(
        private logger: Logger,
        private cacheManager: CacheManager
    ) {}
    
    async execute(context: vscode.ExtensionContext): Promise<void> {
        try {
            const isActive = context.globalState.get('visualCodeMap.active');
            
            if (!isActive) {
                vscode.window.showInformationMessage('No active code map to refresh');
                return;
            }
            
            this.logger.info('Refreshing code map...');
            
            this.cacheManager.clear();
            
            await vscode.commands.executeCommand('visualCodeMap.generate');
            
            vscode.window.showInformationMessage('Code map refreshed successfully');
            
        } catch (error) {
            this.logger.error('Failed to refresh code map', error);
            vscode.window.showErrorMessage(`Failed to refresh code map: ${error}`);
        }
    }
}
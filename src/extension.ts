import * as vscode from 'vscode';
import { GenerateMapCommand } from './commands/generateMap';
import { RefreshMapCommand } from './commands/refreshMap';
import { ExportMapCommand } from './commands/exportMap';
import { Logger } from './utils/logger';
import { CacheManager } from './utils/cache';

let logger: Logger;
let cacheManager: CacheManager;

export function activate(context: vscode.ExtensionContext) {
    logger = new Logger('Visual Code Map');
    cacheManager = new CacheManager(context);
    
    logger.info('Visual Code Map extension is activating...');
    
    context.globalState.update('visualCodeMap.active', false);
    
    const generateCommand = new GenerateMapCommand(logger, cacheManager);
    const refreshCommand = new RefreshMapCommand(logger, cacheManager);
    const exportCommand = new ExportMapCommand(logger);
    
    context.subscriptions.push(
        vscode.commands.registerCommand('visualCodeMap.generate', () => {
            return generateCommand.execute(context);
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('visualCodeMap.refresh', () => {
            return refreshCommand.execute(context);
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('visualCodeMap.export', () => {
            return exportCommand.execute(context);
        })
    );
    
    logger.info('Visual Code Map extension activated successfully');
}

export function deactivate() {
    if (logger) {
        logger.info('Visual Code Map extension is deactivating...');
    }
    
    if (cacheManager) {
        cacheManager.clear();
    }
    
    vscode.commands.executeCommand('setContext', 'visualCodeMap.active', false);
}
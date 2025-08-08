import * as vscode from 'vscode';

export class Logger {
    private outputChannel: vscode.OutputChannel;
    private debugMode: boolean;
    
    constructor(name: string) {
        this.outputChannel = vscode.window.createOutputChannel(name);
        this.debugMode = vscode.workspace.getConfiguration('visualCodeMap').get('debug', false);
    }
    
    info(message: string, ...args: any[]): void {
        this.log('INFO', message, ...args);
    }
    
    warn(message: string, ...args: any[]): void {
        this.log('WARN', message, ...args);
    }
    
    error(message: string, error?: any): void {
        const errorMessage = error ? `${message}: ${error.message || error}` : message;
        this.log('ERROR', errorMessage);
        if (error?.stack && this.debugMode) {
            this.log('STACK', error.stack);
        }
    }
    
    debug(message: string, ...args: any[]): void {
        if (this.debugMode) {
            this.log('DEBUG', message, ...args);
        }
    }
    
    private log(level: string, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (args.length > 0) {
            const argsString = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            this.outputChannel.appendLine(`${formattedMessage} ${argsString}`);
        } else {
            this.outputChannel.appendLine(formattedMessage);
        }
        
        if (level === 'ERROR') {
            this.outputChannel.show(true);
        }
    }
    
    show(): void {
        this.outputChannel.show();
    }
    
    clear(): void {
        this.outputChannel.clear();
    }
    
    dispose(): void {
        this.outputChannel.dispose();
    }
}
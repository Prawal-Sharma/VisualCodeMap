import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs';

interface CacheEntry {
    hash: string;
    data: any;
    timestamp: number;
}

export class CacheManager {
    private cache: Map<string, CacheEntry>;
    private readonly cacheKey = 'visualCodeMap.cache';
    private readonly maxAge = 1000 * 60 * 60; // 1 hour
    
    constructor(private context: vscode.ExtensionContext) {
        this.cache = new Map();
        this.loadCache();
    }
    
    private loadCache(): void {
        const config = vscode.workspace.getConfiguration('visualCodeMap');
        if (!config.get('cacheEnabled', true)) {
            return;
        }
        
        const storedCache = this.context.globalState.get<[string, CacheEntry][]>(this.cacheKey);
        if (storedCache) {
            this.cache = new Map(storedCache);
            this.cleanExpired();
        }
    }
    
    private saveCache(): void {
        const config = vscode.workspace.getConfiguration('visualCodeMap');
        if (!config.get('cacheEnabled', true)) {
            return;
        }
        
        const cacheArray = Array.from(this.cache.entries());
        this.context.globalState.update(this.cacheKey, cacheArray);
    }
    
    private cleanExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.maxAge) {
                this.cache.delete(key);
            }
        }
    }
    
    async get(filePath: string): Promise<any | null> {
        const config = vscode.workspace.getConfiguration('visualCodeMap');
        if (!config.get('cacheEnabled', true)) {
            return null;
        }
        
        const entry = this.cache.get(filePath);
        if (!entry) {
            return null;
        }
        
        const currentHash = await this.getFileHash(filePath);
        if (currentHash !== entry.hash) {
            this.cache.delete(filePath);
            return null;
        }
        
        if (Date.now() - entry.timestamp > this.maxAge) {
            this.cache.delete(filePath);
            return null;
        }
        
        return entry.data;
    }
    
    async set(filePath: string, data: any): Promise<void> {
        const config = vscode.workspace.getConfiguration('visualCodeMap');
        if (!config.get('cacheEnabled', true)) {
            return;
        }
        
        const hash = await this.getFileHash(filePath);
        this.cache.set(filePath, {
            hash,
            data,
            timestamp: Date.now()
        });
        
        this.saveCache();
    }
    
    private async getFileHash(filePath: string): Promise<string> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch {
            return '';
        }
    }
    
    invalidate(filePath: string): void {
        this.cache.delete(filePath);
        this.saveCache();
    }
    
    clear(): void {
        this.cache.clear();
        this.context.globalState.update(this.cacheKey, undefined);
    }
    
    getStats(): { size: number; entries: number } {
        return {
            size: JSON.stringify(Array.from(this.cache.entries())).length,
            entries: this.cache.size
        };
    }
}
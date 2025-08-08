// Declare global for TypeScript
declare global {
    function createMockContext(): any;
}

// Mock VS Code API
const vscode = {
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        createOutputChannel: jest.fn(() => ({
            appendLine: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        })),
        createWebviewPanel: jest.fn(),
        showSaveDialog: jest.fn(),
        showQuickPick: jest.fn(),
        withProgress: jest.fn((_options, task) => {
            return task(
                { report: jest.fn() },
                { isCancellationRequested: false }
            );
        })
    },
    workspace: {
        getConfiguration: jest.fn(() => ({
            get: jest.fn((_key, defaultValue) => defaultValue),
            update: jest.fn()
        })),
        workspaceFolders: [{
            uri: {
                fsPath: '/test/workspace',
                path: '/test/workspace'
            },
            name: 'Test Workspace',
            index: 0
        }],
        openTextDocument: jest.fn(),
        rootPath: '/test/workspace'
    },
    commands: {
        executeCommand: jest.fn(),
        registerCommand: jest.fn()
    },
    Uri: {
        file: jest.fn(path => ({ fsPath: path, path })),
        joinPath: jest.fn((uri, ...paths) => ({
            fsPath: [uri.fsPath, ...paths].join('/'),
            path: [uri.path, ...paths].join('/')
        }))
    },
    ExtensionContext: jest.fn(),
    ProgressLocation: {
        Notification: 15,
        SourceControl: 1,
        Window: 10
    },
    ViewColumn: {
        One: 1,
        Two: 2,
        Three: 3
    },
    CancellationToken: {
        None: { isCancellationRequested: false }
    }
};

// @ts-ignore
global.vscode = vscode;

// Mock modules
jest.mock('vscode', () => vscode, { virtual: true });

// Mock file system
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        readdir: jest.fn(),
        stat: jest.fn(),
        access: jest.fn()
    },
    existsSync: jest.fn(),
    readFileSync: jest.fn()
}));

// Mock crypto
jest.mock('crypto', () => ({
    createHash: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => 'mock-hash')
    }))
}));

// Global test utilities
(global as any).createMockContext = () => ({
    subscriptions: [],
    workspaceState: {
        get: jest.fn(),
        update: jest.fn()
    },
    globalState: {
        get: jest.fn(),
        update: jest.fn(),
        setKeysForSync: jest.fn()
    },
    extensionPath: '/test/extension',
    extensionUri: {
        fsPath: '/test/extension',
        path: '/test/extension'
    },
    environmentVariableCollection: {
        clear: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
        prepend: jest.fn(),
        append: jest.fn(),
        replace: jest.fn()
    },
    asAbsolutePath: jest.fn(path => `/test/extension/${path}`),
    storagePath: '/test/storage',
    globalStoragePath: '/test/global-storage',
    logPath: '/test/logs'
});

export { vscode };
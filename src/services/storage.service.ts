import * as vscode from 'vscode';

export class StorageService {
    static async get(key: string): Promise<string | undefined> {
        const secretStorage = vscode.workspace.getConfiguration('creatorExtension');
        return await secretStorage.get<string>(key); 
    }

    static async set(key: string, value: string): Promise<void> {
        const secretStorage = vscode.workspace.getConfiguration('creatorExtension');
        await secretStorage.update(key, value, true);
    }
}

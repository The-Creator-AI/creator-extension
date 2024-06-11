import * as vscode from 'vscode';

interface LlmRepositoryData {
    apiKeys: { [key: string]: string };
}

const defaultLLMRepositoryData: LlmRepositoryData = {
    apiKeys: {},
};

export class LlmRepository {
    private static getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('creatorExtension');
    }

    static async getLLMRepository() {
        const llmRepository = await this.getConfiguration().get<LlmRepositoryData>('llmRepository');
        if (!llmRepository) {
            await this.getConfiguration().update('llmRepository', defaultLLMRepositoryData, true);
            return defaultLLMRepositoryData;
        }
        return llmRepository;
    }

    private static async patchLLMRepository(llmRepository: Partial<LlmRepositoryData>) {
        const llmRepositoryData = await this.getLLMRepository();
        const updatedLlmRepository = {
            ...llmRepositoryData,
            ...llmRepository
        };
        await this.getConfiguration().update('llmRepository', updatedLlmRepository, true);
    }

    static async getLLMApiKeys(): Promise<{ [key: string]: string }> {
        const llmApiKeys = (await this.getLLMRepository()).apiKeys;
        if (!llmApiKeys) {
            await this.patchLLMRepository({
                apiKeys: defaultLLMRepositoryData.apiKeys
            });
            return {};
        }
        return llmApiKeys;
    }

    private static async patchLLMApiKeys(newApiKeys: { [key: string]: string }): Promise<void> {
        const apiKeysExisting = await this.getLLMApiKeys();
        const apiKeys = {
            ...apiKeysExisting,
            ...newApiKeys
        };
        await this.patchLLMRepository({ apiKeys });
    }

    static async getLLMApiKey(service: string): Promise<string | undefined> {
        const apiKeys = await this.getLLMApiKeys();
        return apiKeys[service];
    }

    static async setLLMApiKey(service: string, apiKey: string): Promise<void> {
        await this.patchLLMApiKeys({ [service]: apiKey });
    }

    static async deleteLLMApiKey(service: string): Promise<void> {
        const apiKeys = await this.getLLMApiKeys();
        if (apiKeys[service]) {
            delete apiKeys[service]; 
            await this.patchLLMApiKeys(apiKeys);
        }
    }
}

import * as vscode from 'vscode';

interface LlmRepositoryData {
    apiKeys: { [service: string]: string[] }; // Changed: apiKeys now stores arrays of keys
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

    static async getLLMApiKeys(): Promise<{ [service: string]: string[] }> {
        const llmApiKeys = (await this.getLLMRepository()).apiKeys;
        if (!llmApiKeys) {
            await this.patchLLMRepository({
                apiKeys: defaultLLMRepositoryData.apiKeys
            });
            return {};
        }
        return llmApiKeys;
    }

    private static async patchLLMApiKeys(newApiKeys: { [service: string]: string[] }): Promise<void> {
        const apiKeysExisting = await this.getLLMApiKeys();
        const apiKeys = {
            ...apiKeysExisting,
            ...newApiKeys
        };
        await this.patchLLMRepository({ apiKeys });
    }

    static async getLLMApiKey(service: string): Promise<string | undefined> {
        const apiKeys = await this.getLLMApiKeys();
        // Return the first key in the array
        return apiKeys[service]?.[0];
    }

    static async setLLMApiKey(service: string, apiKey: string): Promise<void> {
        const apiKeys = await this.getLLMApiKeys();
        if (!apiKeys[service]) {
            apiKeys[service] = []; // Initialize the array if it doesn't exist
        }
        apiKeys[service].push(apiKey); // Add the new key to the array
        await this.patchLLMApiKeys(apiKeys);
    }

    static async deleteLLMApiKey(service: string, apiKeyToDelete: string): Promise<void> { // Added apiKeyToDelete parameter
        const apiKeys = await this.getLLMApiKeys();
        if (apiKeys[service]) {
            apiKeys[service] = apiKeys[service].filter(key => key !== apiKeyToDelete); // Remove the key from the array
            await this.patchLLMApiKeys(apiKeys);
        }
    }
}

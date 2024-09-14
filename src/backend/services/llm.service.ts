import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import * as openai from 'openai';
import * as vscode from 'vscode';
import { LlmRepository } from '../repositories/llm.repository';
import { CreatorService } from './creator.service';
import { ChatMessage } from '../repositories/chat.respository';
import { Inject, Injectable } from 'injection-js';

@Injectable()
export class LlmService {
    private geminiProModel: string = 'gemini-1.5-pro-exp-0827'; // Default model
    private geminiFlashModel: string = 'gemini-1.5-flash-latest';
    private openaiModel: string = 'gpt-3.5-turbo';

    private currentModel: string = this.geminiProModel; // Track the current model being used

    constructor(@Inject(CreatorService) private readonly creatorService: CreatorService) { }

    async sendPrompt(
        chatHistory: ChatMessage[],
        selectedFiles: string[] = []
    ): Promise<string> {
        const { type, apiKeys } = await this.getApiKey();
        console.log({ type, apiKeys, chatHistory, selectedFiles });

        // Read selected files content
        const fileContents = this.creatorService.readSelectedFilesContent(
            selectedFiles
        );

        // Append file contents to prompt
        let prompt = '';
        for (const filePath in fileContents) {
            prompt += `\n\n\`\`\`
File: ${filePath}
${fileContents[filePath]}
\`\`\`\n\n`;
        }
        chatHistory.forEach((message) => {
            prompt += `${message.user}: ${message.message}\n`;
        });

        console.log(`Prompt:\n\n\n`);
        console.log(prompt);

        if (type === 'gemini') {
            return this.sendPromptToGemini(prompt, apiKeys);
        } else if (type === 'openai') {
            return this.sendPromptToOpenAI(prompt, apiKeys[0]); // Assuming only one OpenAI key is stored
        } else {
            throw new Error(
                'No API key found. Please set either GEMINI_API_KEY or OPENAI_API_KEY environment variable.',
            );
        }
    }

    private async sendPromptToGemini(prompt: string, apiKeys: string[]): Promise<string> {
        let debounce = 0;
        let attempts = 0;
        let responseText = '';
        let currentKeyIndex = 0; // Track the current key being used

        while (attempts < 3) {
            attempts++;
            if (debounce > 0) {
                console.log(
                    `Waiting for ${Math.floor(debounce / 1000)} seconds...`,
                );
            }
            console.log(`Using model: ${this.currentModel}`);
            await new Promise((resolve) => setTimeout(resolve, debounce));
            try {
                const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
                const gemini = genAI.getGenerativeModel({
                    model: this.currentModel,
                }); // Use currentModel here
                const response = await gemini.generateContentStream({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: 'text/plain',
                    },
                    safetySettings: [{
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    }]
                });

                for await (const chunk of response.stream) {
                    responseText += chunk.text();
                    console.log(chunk.text());
                }
                debounce = 0;
                return responseText;
            } catch (e: any) {
                debounce += 5000;
                if (
                    e.status === 429 &&
                    this.currentModel === this.geminiProModel &&
                    currentKeyIndex < apiKeys.length - 1 // Check if there are more keys to try
                ) {
                    currentKeyIndex++; // Move to the next key
                    console.log(
                        `${this.geminiProModel} limit reached for key ${apiKeys[currentKeyIndex - 1]}, trying with key ${apiKeys[currentKeyIndex]}`,
                    );
                    continue;
                } else if (e.status === 429 && this.currentModel === this.geminiProModel) {
                    this.currentModel = this.geminiFlashModel; // Update currentModel
                    console.log(
                        `${this.geminiProModel} limit reached for all keys, trying with ${this.geminiFlashModel}`,
                    );
                    currentKeyIndex = 0; // Reset key index for the Flash model
                    continue;
                }
                console.log(e);
                // Handle other errors, e.g., throw an error, return a default message, etc.
            }
        }
        throw new Error(
            'Could not get a response from Gemini after multiple attempts.',
        );
    }

    getModelName(): string {
        return this.currentModel; // Access currentModel here
    }

    private async sendPromptToOpenAI(prompt: string, apiKey: string): Promise<string> {
        const model = new openai.OpenAI({ apiKey });

        this.currentModel = this.openaiModel;
        const response = await model.completions.create({
            model: this.openaiModel,
            prompt: prompt,
        });

        return response.choices[0].text || '';
    }

    private async getApiKey(): Promise<any> {
        const apiKeys = await LlmRepository.getLLMApiKeys();
        const type = Object.keys(apiKeys)[0];

        if (type && Array.isArray(apiKeys[type])) {
            return { type, apiKeys: apiKeys[type] };
        } else {
            await this.getApiKeyFromUser();
            return await this.getApiKey();
        }
    }

    private async getApiKeyFromUser(): Promise<any> {
        const apiChoice = await vscode.window.showQuickPick(
            [
                { label: 'Gemini API Key', value: 'gemini' },
                { label: 'OpenAI API Key', value: 'openai' },
            ],
            { placeHolder: 'Select the API you want to use' }
        );

        if (apiChoice) {
            const apiKeyInput = await vscode.window.showInputBox({
                prompt: `Enter your ${apiChoice.label}`,
                placeHolder: apiChoice.value === 'gemini' ? 'Enter Gemini API Key' : 'Enter OpenAI API Key',
                password: true, // Mask the input for security
            });
            console.log({ apiKeyInput, apiChoice });
            if (apiKeyInput) {
                await LlmRepository.setLLMApiKey(apiChoice.value, apiKeyInput);
            }
        }
    }
}